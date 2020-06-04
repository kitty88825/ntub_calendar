from rest_framework import serializers

from .models import Calendar, Subscription


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ('id', 'name')


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ('calendar',)
        ready_only_fields = ('id', 'user')


class SubscriptionCreateSerializer(serializers.Serializer):
    calendar = serializers.ListField(
        child=serializers.IntegerField(write_only=True),
    )

    def create(self, validated_data):
        user = validated_data['user']
        calendar_ids = validated_data['calendar']
        calendars = Calendar.objects.filter(id__in=calendar_ids)

        Subscription.objects.bulk_create(
            [Subscription(user=user, calendar=id) for id in calendars],  # noqa: 501
        )

        return validated_data
