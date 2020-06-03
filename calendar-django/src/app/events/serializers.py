from rest_framework import serializers

from app.users.models import User
from app.users.handlers import get_match

from .models import Attachment, Event, Participant


class AttachmentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ('id', 'event', 'file', 'filename')

    def get_filename(self, attachment):
        return str(attachment.file).split('/')[-1]


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ('id', 'user')


class EventSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    attachments = AttachmentSerializer(many=True, read_only=True)
    user = serializers.CharField(write_only=True, required=False)
    participants = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False,
    )
    participant_set = ParticipantSerializer(many=True, read_only=True)

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
            'user',
            'participants',
            'participant_set',
        )
        read_only_fields = (
            'id',
            'create_at',
            'update_at',
            'attachments',
            'participant_set',
        )

    def create_attachment_for_event(self, event, files):
        if not files:
            return

        Attachment.objects.bulk_create(
            [Attachment(event=event, file=file) for file in files],
        )

    def create_participant_for_event(self, event, user, participants):
        if not Participant.objects.filter(user=user, event=event):
            Participant.objects.create(
                event=event,
                user=user,
                role=Participant.RoleChoice.editors,
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

        Participant.objects.bulk_create(
            [Participant(
                event=event,
                user=user,
                role=Participant.RoleChoice.participants,
            ) for user in User.objects.filter(email__in=participants)],
        )

    def create(self, validated_data):
        user = validated_data.pop('user')
        files = validated_data.pop('files', None)
        participants = validated_data.pop('participants', None)
        event = super().create(validated_data)
        self.create_attachment_for_event(event, files)
        self.create_participant_for_event(event, user, participants)
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
            'user',
            'participants',
            'remove_users',
            'participant_set',
        )

    def update(self, instance, validated_data):
        user = validated_data.pop('user')
        participants = validated_data.pop('participants', None)
        remove_users = validated_data.pop('remove_users', None)
        remove_files = validated_data.pop('remove_files', None)
        files = validated_data.pop('files', None)
        event = super().update(instance, validated_data)

        if remove_files:
            Attachment.objects \
                .filter(id__in=remove_files, event=event) \
                .delete()

        if remove_users:
            Participant.objects.filter(id__in=remove_users, event=event, role=Participant.RoleChoice.participants).delete()  # noqa: E501

        self.create_participant_for_event(event, user, participants)
        self.create_attachment_for_event(event, files)
        return event
