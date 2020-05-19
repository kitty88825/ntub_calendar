from rest_framework import serializers

from .models import Attachment, Event


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('id', 'event', 'file')


class EventSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        allow_null=True,
        required=False,
    )
    attachments = AttachmentSerializer(many=True, read_only=True)

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
        )
        read_only_fields = (
            'id',
            'create_at',
            'update_at',
            'attachments',
        )

    def create(self, validated_data):
        if 'files' in validated_data:
            files = validated_data.pop('files')
            event = super().create(validated_data)
            Attachment.objects.bulk_create(
                [Attachment(event=event, file=file) for file in files],
            )
        else:
            event = super().create(validated_data)
        return event
