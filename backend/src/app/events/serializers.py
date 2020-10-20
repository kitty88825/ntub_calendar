from rest_framework import serializers

from app.calendars.serializers import CalendarSerializer
from app.users.models import User

from .models import Event, EventParticipant, EventAttachment
from .choices import RoleChoice


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
        )

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

    def create(self, validated_data):
        user = validated_data.pop('user')
        files = validated_data.pop('files', None)
        emails = validated_data.pop('emails', None)
        event = super().create(validated_data)
        self.create_attachment_from_event(event, files)
        self.create_participant_from_event(event, user, emails)

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
            'files',
            'attachments',
            'calendars',
            'remove_files',
            'emails',
            'participants',
        )

    def update(self, instance, validated_data):
        user = validated_data.pop('user')
        emails = validated_data.pop('emails', None)
        remove_files = validated_data.pop('remove_files', None)
        files = validated_data.pop('files', None)
        event = super().update(instance, validated_data)

        if remove_files:
            EventAttachment.objects \
                .filter(id__in=remove_files, event=event) \
                .delete()

        Event.participants.through \
            .objects \
            .filter(event=event, role='participants') \
            .exclude(user__email__in=emails) \
            .delete()

        self.create_attachment_from_event(event, files)
        self.create_participant_from_event(event, user, emails)

        return event
