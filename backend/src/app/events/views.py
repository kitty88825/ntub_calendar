from django.db.models import Q
from datetime import datetime

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django_filters import rest_framework as filters

from .models import Event
from .serializers import (
    EventSerializer,
    UpdateEventAttachmentSerializer,
    SubscribeEventSerializer,
    SuggestedTimeSerializer,
)
from .permission import HasCalendarPermissionOrParticipant
from .filters import SubscriberEventsFilter
from .functions import DateTimeMerge


def datetime_to_timestamp(data: list):
    if not data:
        return

    response = []
    for d in data:
        response.append([d['start_at'].timestamp(), d['end_at'].timestamp()])

    return response


def timestamp_to_datetime(data: list):
    if not data:
        return

    response = []
    for d in data:
        response.append([
            datetime.fromtimestamp(d[0]),
            datetime.fromtimestamp(d[1]),
        ])

    return response


class EventViewSet(ModelViewSet):
    queryset = Event.objects.prefetch_related('attachments')
    permission_classes = [HasCalendarPermissionOrParticipant]
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = SubscriberEventsFilter

    def get_queryset(self):
        if self.request.user.is_authenticated:
            user = self.request.user
            return Event.objects \
                .filter(
                    Q(calendars__display='public') |
                    (
                        Q(calendars__permissions__group__user=user) &
                        Q(calendars__permissions__role=user.role)
                    ) |
                    (
                        Q(participants=user.id)
                    ),
                ) \
                .distinct()
        else:
            return Event.objects.filter(calendars__display='public').distinct()

    def get_serializer_class(self):
        if self.action.endswith('subscribe'):
            return SubscribeEventSerializer
        elif self.action == 'suggested_time':
            return SuggestedTimeSerializer
        elif self.action == 'partial_update' or self.action == 'update':
            serializer_class = UpdateEventAttachmentSerializer
        else:
            serializer_class = EventSerializer

        return serializer_class

    def perform_create(self, serializers):
        serializers.save(user=self.request.user)

    def perform_update(self, serializers):
        serializers.save(user=self.request.user)

    @action(['POST'], False, permission_classes=[IsAuthenticated])
    def subscribe(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.request.user.subscribe_events.add(
            *Event.objects.filter(id__in=serializer.data['events']),
        )

        res_serializer = EventSerializer(
            self.request.user.subscribe_events.all(),
            many=True,
        )

        return Response(res_serializer.data)

    @action(['POST'], False, permission_classes=[IsAuthenticated])
    def unsubscribe(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.request.user.subscribe_events.remove(
            *Event.objects.filter(id__in=serializer.data['events']),
        )

        res_serializer = EventSerializer(
            self.request.user.subscribe_events.all(),
            many=True,
        )

        return Response(res_serializer.data)

    @action(['POST'], False, permission_classes=[IsAuthenticated])
    def suggested_time(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event_list = Event.objects.filter(
            Q(eventparticipant__user__email__in=serializer.data['emails']),
            Q(start_at__gte=serializer.data['start_at']),
            Q(end_at__lte=serializer.data['end_at']),
        ).values('start_at', 'end_at').distinct()

        if event_list.count() > 1:
            time_obj = DateTimeMerge()
            busy_time = time_obj.merge(datetime_to_timestamp(event_list))

            return Response(timestamp_to_datetime(busy_time))
