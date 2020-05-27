from rest_framework import serializers

from .models import Attachment, Event, Participant


class AttachmentSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ('id', 'event', 'file', 'filename')

    def get_filename(self, attachment):
        return str(attachment.file).split('/')[-1]


class EventSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    attachments = AttachmentSerializer(many=True, read_only=True)
    user = serializers.CharField(write_only=True, required=False)

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
        )
        read_only_fields = (
            'id',
            'create_at',
            'update_at',
            'attachments',
        )

    def create_attachment_for_event(self, event, files):
        if not files:
            return

        Attachment.objects.bulk_create(
            [Attachment(event=event, file=file) for file in files],
        )

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        files = validated_data.pop('files', None)
        event = super().create(validated_data)
        Participant.objects.create(
            event=event,
            user=user,
            role=Participant.RoleChoice.editors,
        )
        self.create_attachment_for_event(event, files)
        return event


class UpdateAttachmentSerializer(EventSerializer):
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
        )

    def update(self, instance, validated_data):
        remove_files = validated_data.pop('remove_files', None)
        files = validated_data.pop('files', None)
        event = super().update(instance, validated_data)

        if remove_files:
            Attachment.objects \
                .filter(id__in=remove_files, event=event) \
                .delete()

        self.create_attachment_for_event(event, files)
        return event
