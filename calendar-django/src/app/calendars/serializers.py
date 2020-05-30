from rest_framework import serializers

from .models import Calendar
from .models import Subscription


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ('id', 'name')


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ('calendar',)
        ready_only_fields = ('id', 'user')

    def create(self, validated_data):
        subscription = super().create(validated_data)
        return subscription
