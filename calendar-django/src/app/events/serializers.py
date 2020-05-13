from rest_framework import serializers

from .models import Attachment, Event


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(child=serializers.FileField())

    class Meta:
        model = Event
        exclude = ['create_at', 'update_at']

    def create(self, validated_data):
        attachments = validated_data.pop('attachments')
        event = super().create(validated_data)
        Attachment.objects.bulk_create(
            [Attachment(event=event, name=a) for a in attachments],
        )
        return event

    def to_representation(self, instance):
        self.fields['attachments'] = AttachmentSerializer(many=True)
        return super().to_representation(instance)
