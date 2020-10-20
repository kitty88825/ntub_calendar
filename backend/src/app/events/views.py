from django.db.models import Q

from rest_framework.viewsets import ModelViewSet

from .models import Event
from .serializers import EventSerializer, UpdateEventAttachmentSerializer


class EventViewSet(ModelViewSet):
    queryset = Event.objects.prefetch_related('attachments')

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Event.objects \
                .filter(
                    Q(calendars__groups__in=self.request.user.groups.all()) |
                    Q(calendars__display='public') |
                    Q(participants=self.request.user.id),
                ) \
                .distinct()
        else:
            return Event.objects.filter(calendars__display='public').distinct()

    def get_serializer_class(self):
        if self.action == 'partial_update' or self.action == 'update':
            serializer_class = UpdateEventAttachmentSerializer
        else:
            serializer_class = EventSerializer

        return serializer_class

    def perform_create(self, serializers):
        serializers.save(user=self.request.user)

    def perform_update(self, serializers):
        serializers.save(user=self.request.user)
