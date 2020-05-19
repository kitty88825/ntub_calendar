from rest_framework.viewsets import ModelViewSet

from .models import Event
from .serializers import EventSerializer


class EventViewSet(ModelViewSet):
    queryset = Event.objects.prefetch_related('attachments')
    serializer_class = EventSerializer
