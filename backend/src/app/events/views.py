from django.db.models import Q
from django.shortcuts import redirect

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404

from django_filters import rest_framework as filters

from app.users.models import User
from core import settings

from .models import Event, EventParticipant
from .serializers import (
    EventSerializer,
    UpdateEventAttachmentSerializer,
    SubscribeEventSerializer,
    SuggestedTimeSerializer,
    ResponseParticipantSerializer,
    EventParticipantSerializer,
)
from .permission import HasCalendarPermissionOrParticipant
from .filters import SubscriberEventsFilter
from .functions import (
    DateTimeMerge,
    datetime_to_timestamp,
    get_free_time,
)


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
        elif self.action == 'response':
            return ResponseParticipantSerializer
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
        emails = serializer.data['emails']
        start_at = serializer.data['start_at']
        end_at = serializer.data['end_at']

        event_list = Event.objects \
            .values('start_at', 'end_at') \
            .filter(Q(eventparticipant__user__email__in=emails)) \
            .exclude(Q(start_at__gte=end_at) | Q(end_at__lte=start_at)) \
            .distinct()

        if event_list.count() > 1:
            # 交集得時間 > 1
            time_obj = DateTimeMerge()
            busy_time = time_obj.merge(datetime_to_timestamp(event_list))
        else:
            # 交集得時間 1 or 0
            busy_time = datetime_to_timestamp(event_list)

        # 交集時間 == 0
        if not busy_time:
            return Response('All participants can attend!')

        return Response(get_free_time(busy_time, start_at, end_at))

    @action(['POST'], True, permission_classes=[IsAuthenticated])
    def response(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = serializer.data['response']
        try:
            event = EventParticipant.objects.get(event=pk, user=request.user)
            event.response = response
            event.save()

            return Response(EventParticipantSerializer(event).data)
        except Exception:
            return Response("You don't have permission.")


def response_event(request, code, eid, response):
    user = get_object_or_404(User, verification_code=code)
    event = EventParticipant.objects.get(event=eid, user=user)
    event.response = response
    event.save()

    return redirect(f'{settings.FRONTEND_URL}{eid}')
