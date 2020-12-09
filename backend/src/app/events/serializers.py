from django.db.models import Q

from rest_framework import serializers

from app.calendars.serializers import CalendarSerializer
from app.calendars.models import Calendar
from app.users.models import User
from telegram_bot.models import TelegramBot

from .choices import RoleChoice, EventParticipantResponseChoice
from .schedule import schedule, send_email_task
from .models import (
    Event,
    EventParticipant,
    EventAttachment,
    EventInviteCalendar,
)


def validate_ntub_email(email: str):
    if not email.endswith('@ntub.edu.tw'):
        raise serializers.ValidationError('This is not a ntub email.')


def validate_response_particiapnt(response: str):
    try:
        EventParticipantResponseChoice(response)
    except Exception:
        raise serializers.ValidationError('Response content does not match.')


class AttachmentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()

    class Meta:
        model = EventAttachment
        fields = ('id', 'event', 'file', 'filename')

    def get_filename(self, attachment):
        return str(attachment.file).split('/')[-1]


class EventParticipantSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = EventParticipant
        fields = ('user', 'role', 'response')

    def get_user(self, event_participnat):
        return str(event_participnat.user)


class EventInviteCalendarSerializer(serializers.ModelSerializer):
    calendar = serializers.SerializerMethodField()
    main_calendar = serializers.SerializerMethodField()

    class Meta:
        model = EventInviteCalendar
        fields = ('calendar', 'main_calendar', 'response')

    def get_calendar(self, event_invite_calendar):
        return CalendarSerializer(event_invite_calendar.calendar).data

    def get_main_calendar(self, event_invite_calendar):
        return CalendarSerializer(event_invite_calendar.main_calendar).data


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
    eventinvitecalendar_set = EventInviteCalendarSerializer(
        many=True,
        read_only=True,
    )
    attachments = AttachmentSerializer(many=True, read_only=True)
    eventparticipant_set = EventParticipantSerializer(
        many=True,
        read_only=True,
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
            'main_calendar_id',
            'invite_calendars_id',
            'attachments',
            'eventinvitecalendar_set',
            'eventparticipant_set',
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
        # 發信給未回應的使用者
        users = User.objects.filter(
            Q(eventparticipant__event=event),
            Q(eventparticipant__response='no_reply'),
            Q(eventparticipant__role='participants'),
        )
        if users:
            for user in users:
                send_email_task(event, user)

    def create_calendar_from_event(self, event, main_calendar, calendars_id):
        if not calendars_id:
            return

        in_db_calendars = event.eventinvitecalendar_set \
            .values_list('calendar_id', flat=True)

        new_calendars_id = set(calendars_id) - set(in_db_calendars)
        EventInviteCalendar.objects.bulk_create(
            [EventInviteCalendar(
                event_id=event.id,
                calendar_id=c,
                main_calendar_id=main_calendar,
                response='no_reply',
            ) for c in new_calendars_id],
        )

    def create(self, validated_data):
        user = validated_data.pop('user')
        main_calendar_id = validated_data.pop('main_calendar_id')
        invite_calendars_id = validated_data.pop('invite_calendars_id', None)
        files = validated_data.pop('files', None)
        emails = validated_data.pop('emails', None)
        event = super().create(validated_data)

        EventInviteCalendar.objects.create(
            event_id=event.id,
            calendar_id=main_calendar_id,
            main_calendar_id=main_calendar_id,
            response='accept',
        )

        self.create_attachment_from_event(event, files)
        self.create_participant_from_event(event, user, emails)
        self.create_calendar_from_event(
            event,
            main_calendar_id,
            invite_calendars_id,
        )
        if emails:
            user_id = User.objects.values('id').filter(email__in=emails)
            user = TelegramBot.objects.filter(user_id__in=user_id)
            if validated_data['nature'] == 'meeting' and user:
                schedule(event.id)

        return event


class UpdateEventAttachmentSerializer(EventSerializer):
    remove_files = serializers.ListField(
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
            'main_calendar_id',
            'invite_calendars_id',
            'files',
            'emails',
            'remove_files',
            'attachments',
            'eventinvitecalendar_set',
            'eventparticipant_set',
        )

    def update(self, instance, validated_data):
        user = validated_data.pop('user')
        main_calendar_id = validated_data.pop('main_calendar_id', None)
        invite_calendars_id = validated_data.pop('invite_calendars_id', None)
        emails = validated_data.pop('emails', None)
        remove_files = validated_data.pop('remove_files', None)
        files = validated_data.pop('files', None)
        event = super().update(instance, validated_data)

        if main_calendar_id is None:
            main_calendar_id = event.eventinvitecalendar_set \
                .values_list('main_calendar', flat=True) \
                .first()

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

        if invite_calendars_id:
            Event.calendars.through \
                .objects \
                .filter(event=event) \
                .exclude(
                    calendar_id=main_calendar_id,
                    main_calendar=main_calendar_id) \
                .exclude(calendar_id__in=invite_calendars_id) \
                .delete()

        self.create_attachment_from_event(event, files)
        self.create_participant_from_event(event, user, emails)
        self.create_calendar_from_event(
            event,
            main_calendar_id,
            invite_calendars_id,
        )

        return event


class SubscribeEventSerializer(serializers.Serializer):
    events = serializers.ListField(child=serializers.IntegerField())

    def validate_events(self, value):
        return Event.objects.filter(
            Q(calendars__display='public') |
            Q(calendars__groups__user=self.context['request'].user) |
            Q(participants=self.context['request'].user.id),
            Q(id__in=value),
        ).values_list('id', flat=True)


class SuggestedTimeSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=serializers.EmailField(validators=[validate_ntub_email]),
    )
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()


class ResponseParticipantSerializer(serializers.Serializer):
    response = serializers.CharField(
        validators=[validate_response_particiapnt],
    )
