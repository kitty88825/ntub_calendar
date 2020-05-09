from rest_framework.viewsets import ModelViewSet

from .models import Event, Attachment
from .serializers import EventSerializer, AttachmentSerializer


class EventViewSet(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class AttachmentViewSet(ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
