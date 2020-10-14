from rest_framework import serializers

from .models import Calendar, CalendarPermission


class CalendarPermissionSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = CalendarPermission
        fields = ('id', 'group', 'group_name', 'role', 'authority')
        read_only_fields = ('id',)


class CalendarSerializer(serializers.ModelSerializer):
    permissions = CalendarPermissionSerializer(many=True, required=True)

    class Meta:
        model = Calendar
        fields = (
            'id',
            'name',
            'description',
            'display',
            'color',
            'permissions',
        )
        read_only_fields = ('id',)
        extra_kwargs = {
            'display': {'required': True},
            'color': {'required': True},
        }

    def create_permissions(self, calendar, permissions):
        CalendarPermission.objects.bulk_create(
            [CalendarPermission(calendar=calendar, **p) for p in permissions],
        )

    def create(self, validated_data):
        permissions = validated_data.pop('permissions')
        calendar = super().create(validated_data)
        self.create_permissions(calendar, permissions)

        return calendar

    def update(self, instance, validated_data):
        permissions = validated_data.pop('permissions')
        calendar = super().update(instance, validated_data)
        CalendarPermission.objects.filter(calendar=calendar).delete()
        self.create_permissions(calendar, permissions)

        return calendar
