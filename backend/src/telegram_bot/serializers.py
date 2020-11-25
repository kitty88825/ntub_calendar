from rest_framework import serializers

from app.events.models import Event, EventParticipant
from app.calendars.models import Calendar


class GetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'start_at', 'end_at', 'description', 'location']


class MeetingSerializer(serializers.ModelSerializer):
    event = serializers.SerializerMethodField()

    class Meta:
        model = EventParticipant
        fields = ['event', 'response']

    def get_event(self, event):
        return str(event.event)


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['name']
