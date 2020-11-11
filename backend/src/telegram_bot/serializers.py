from rest_framework import serializers

from app.events.models import Event


class GetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'start_at', 'end_at', 'description', 'location']
