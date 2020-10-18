from rest_framework import serializers

from app.calendars.serializers import CalendarSerializer
from app.users.models import User
from app.users.handlers import get_match

from .models import Event, EventParticipant, EventAttachment


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
    attachments = AttachmentSerializer(many=True, read_only=True)
    emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False,
    )
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
            'files',
            'attachments',
            'calendars',
            'emails',
            'participants',
        )
        read_only_fields = (
            'id',
            'create_at',
            'update_at',
            'attachments',
            'participants',
        )

    def create_attachment_for_event(self, event, files):
        if not files:
            return

        EventAttachment.objects.bulk_create(
            [EventAttachment(event=event, file=file) for file in files],
        )

    def create_participant_for_event(self, event, user, participants):
        if not EventParticipant.objects.filter(user=user, event=event):
            EventParticipant.objects.create(
                event=event,
                user=user,
                role=EventParticipant.RoleChoice.editors,
            )

        if not participants:
            return

        in_user_model = User.objects.values_list('email', flat=True) \
                            .filter(email__in=participants)

        for email in set(participants) - set(in_user_model):
            if get_match(email) is not None:
                User.objects.create(username=email, email=email)

        for user_email in User.objects.filter(email__in=participants):
            if user_email.participant_set.filter(event=event):
                participants.remove(user_email.email)

        EventParticipant.objects.bulk_create(
            [EventParticipant(
                event=event,
                user=user,
                role=EventParticipant.RoleChoice.participants,
            ) for user in User.objects.filter(email__in=participants)],
        )

    def create(self, validated_data):
        user = validated_data.pop('user')
        files = validated_data.pop('files', None)
        emails = validated_data.pop('emails', None)
        event = super().create(validated_data)
        self.create_attachment_for_event(event, files)
        self.create_participant_for_event(event, user, emails)

        return event


class UpdateAttachmentSerializer(EventSerializer):
    remove_files = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )

    remove_users = serializers.ListField(
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
            'files',
            'attachments',
            'calendars',
            'remove_files',
            'emails',
            'remove_users',
            'participants',
        )

    def update(self, instance, validated_data):
        user = validated_data.pop('user')
        emails = validated_data.pop('emails', None)
        remove_users = validated_data.pop('remove_users', None)
        remove_files = validated_data.pop('remove_files', None)
        files = validated_data.pop('files', None)
        event = super().update(instance, validated_data)

        if remove_files:
            EventAttachment.objects \
                .filter(id__in=remove_files, event=event) \
                .delete()

        if remove_users:
            EventParticipant.objects \
                .filter(
                    id__in=remove_users,
                    event=event,
                    role=EventParticipant.RoleChoice.participants) \
                .delete()

        self.create_participant_for_event(event, user, emails)
        self.create_attachment_for_event(event, files)

        return event
