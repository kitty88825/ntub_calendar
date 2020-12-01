from django.db.models import Q

from rest_framework.permissions import BasePermission, SAFE_METHODS


class HasCalendarPermissionOrParticipant(BasePermission):
    """
    The request is authenticated as a user, or is a read-only request.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and
            request.user.is_authenticated,
        )

    def has_object_permission(self, request, view, obj):
        has_calendar_permissions = obj.calendars.filter(
            Q(permissions__role=request.user.role),
            Q(permissions__authority='write'),
            Q(permissions__group__in=request.user.groups.all()),
        )

        if has_calendar_permissions:
            return True

        return bool(request.user in obj.participants.filter())
