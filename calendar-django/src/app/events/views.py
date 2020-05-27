from rest_framework.viewsets import ModelViewSet

from .models import Event
from .serializers import EventSerializer, UpdateAttachmentSerializer


class EventViewSet(ModelViewSet):
    queryset = Event.objects.prefetch_related('attachments')

    def get_serializer_class(self):
        if self.action == 'partial_update':
            serializer_class = UpdateAttachmentSerializer
        else:
            serializer_class = EventSerializer
        return serializer_class

    def perform_create(self, serializers):
        serializers.save(user=self.request.user)
