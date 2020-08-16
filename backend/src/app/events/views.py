from django.db.models import Q

from rest_framework.viewsets import ModelViewSet

from app.calendars.models import Permission, Calendar
from app.calendars.permission import IsStaffUserEditOnly
from app.users.models import User

from .models import Event
from .serializers import EventSerializer, UpdateAttachmentSerializer


class EventViewSet(ModelViewSet):
    permission_classes = [IsStaffUserEditOnly]
    queryset = Event.objects.prefetch_related('attachments')

    def get_queryset(self):
        calendar_public = Calendar.objects.filter(display='public')
        if self.request.user.is_authenticated:
            user_group = User.objects.filter(id=self.request.user.id).values('groups')  # noqa 501
            calendar_id = Permission.objects.values('calendar').filter(group__in=user_group)  # noqa 501
            return Event.objects \
                .filter(
                    Q(calendars__in=calendar_id) |
                    Q(calendars__in=calendar_public),
                ) \
                .distinct()
        else:
            return Event.objects.filter(calendars__in=calendar_public)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            serializer_class = UpdateAttachmentSerializer
        else:
            serializer_class = EventSerializer
        return serializer_class

    def perform_create(self, serializers):
        serializers.save(user=self.request.user)

    def perform_update(self, serializers):
        serializers.save(user=self.request.user)
