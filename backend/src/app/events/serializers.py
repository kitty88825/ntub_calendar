from django.db.models import Q

from rest_framework import serializers

from app.calendars.serializers import CalendarSerializer
from app.calendars.models import Calendar
from app.users.models import User

from .choices import RoleChoice
from .models import (
    Event,
    EventParticipant,
    EventAttachment,
    EventInviteCalendar,
)


def validate_ntub_email(email: str):
    if not email.endswith('@ntub.edu.tw'):
        raise serializers.ValidationError('This is not a ntub email.')


class AttachmentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()

    class Meta:
        model = EventAttachment
        fields = ('id', 'event', 'file', 'filename')

    def get_filename(self, attachment):
        return str(attachment.file).split('/')[-1]


class EventParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email')


class EventSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    emails = serializers.ListField(
        child=serializers.EmailField(validators=[validate_ntub_email]),
        write_only=True,
        required=False,
    )
    main_calendar_id = serializers.IntegerField(write_only=True)
    invite_calendars_id = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    attachments = AttachmentSerializer(many=True, read_only=True)
    calendars = CalendarSerializer(many=True, read_only=True)
    participants = EventParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'start_at',
            'end_at',
            'description',
            'location',
            'nature',
            'files',
            'emails',
            'main_calendar_id',
            'invite_calendars_id',
            'attachments',
            'calendars',
            'participants',
        )
        read_only_fields = (
            'id',
            'create_at',
            'update_at',
        )

    def validate_main_calendar_id(self, value):
        has_calendar_permissions = Calendar.objects.filter(
            Q(id=value),
            Q(groups__user=self.context['request'].user),
            Q(permissions__role=self.context['request'].user.role),
            Q(permissions__authority='write'),
        )
        if not has_calendar_permissions:
            raise serializers.ValidationError("You don't have permission.")

        return value

    def create_attachment_from_event(self, event, files):
        if not files:
            return

        EventAttachment.objects.bulk_create(
            [EventAttachment(event=event, file=file) for file in files],
        )

    def create_participant_from_event(self, event, user, emails):
        if not emails:
            return

        EventParticipant.objects.get_or_create(
            event=event,
            user=user,
            role=RoleChoice.editors,
        )

        in_db_emails = User.objects \
            .filter(email__in=emails) \
            .values_list('email', flat=True)

        new_emails = set(emails) - set(in_db_emails)
        User.objects.bulk_create([User(email=email) for email in new_emails])
        event.participants.add(
            *User.objects.filter(email__in=emails),
        )

    def create_calendar_from_event(self, event, main_calendar, calendars_id):
        EventInviteCalendar.objects.create(
            event_id=event.id,
            calendar_id=main_calendar,
            main_calendar_id=main_calendar,
            response='accept',
        )

        if not calendars_id:
            return

        EventInviteCalendar.objects.bulk_create(
            [EventInviteCalendar(
                event_id=event.id,
                calendar_id=c,
                main_calendar_id=main_calendar,
                response='no_reply',
            ) for c in calendars_id],
        )

    def create(self, validated_data):
        user = validated_data.pop('user')
        main_calendar_id = validated_data.pop('main_calendar_id')
        invite_calendars_id = validated_data.pop('invite_calendars_id', None)
        files = validated_data.pop('files', None)
        emails = validated_data.pop('emails', None)
        event = super().create(validated_data)
        self.create_attachment_from_event(event, files)
        self.create_participant_from_event(event, user, emails)
        self.create_calendar_from_event(
            event,
            main_calendar_id,
            invite_calendars_id,
        )

        return event


class UpdateEventAttachmentSerializer(EventSerializer):
    remove_files = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    calendars_id = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'start_at',
            'end_at',
            'description',
            'location',
            'nature',
            'files',
            'emails',
            'calendars_id',
            'remove_files',
            'attachments',
            'calendars',
            'participants',
        )

    def validate_calendars_id(self, value):
        user = self.context['request'].user
        has_calendar_permissions = len(Calendar.objects.filter(
            Q(id__in=value),
            Q(permissions__role=user.role),
            Q(permissions__group__in=user.groups.all()),
            Q(permissions__authority='write'),
        ))
        if len(value) != has_calendar_permissions:
            raise serializers.ValidationError("You don't have permission.")
        return value

    def update(self, instance, validated_data):
        user = validated_data.pop('user')
        emails = validated_data.pop('emails', None)
        remove_files = validated_data.pop('remove_files', None)
        files = validated_data.pop('files', None)
        calendars_id = validated_data.pop('calendars_id', None)
        event = super().update(instance, validated_data)

        if remove_files:
            EventAttachment.objects \
                .filter(id__in=remove_files, event=event) \
                .delete()

        if emails:
            Event.participants.through \
                .objects \
                .filter(event=event, role='participants') \
                .exclude(user__email__in=emails) \
                .delete()

        if calendars_id:
            Event.calendars.through \
                .objects \
                .filter(event_id=event) \
                .exclude(calendar_id__in=calendars_id) \
                .delete()

        self.create_attachment_from_event(event, files)
        self.create_participant_from_event(event, user, emails)
        self.create_calendar_from_event(event, calendars_id)

        return event
