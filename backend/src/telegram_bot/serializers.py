from rest_framework import serializers

from app.events.models import Event, EventParticipant


class GetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'start_at', 'end_at', 'description', 'location']


class MeetingSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    event = serializers.SerializerMethodField()

    class Meta:
        model = EventParticipant
        fields = ['event', 'user', 'response']

    def get_user(self, event_participnat):
        return str(event_participnat.user)

    def get_event(self, event):
        return str(event.event)
