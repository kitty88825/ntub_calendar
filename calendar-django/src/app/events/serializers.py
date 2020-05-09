from rest_framework import serializers

from .models import Event, Attachment


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        exclude = ['create_at', 'update_at']


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'
