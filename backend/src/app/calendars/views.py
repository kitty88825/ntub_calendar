from django.db.models import Q

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django_filters import rest_framework as filters

from .models import Calendar
from .serializers import CalendarSerializer, SubscribeCalendarSerializer
from .permission import IsStaffUserEditOnly
from .filters import SubscriberCalendarsFilter


class CalendarViewSet(ModelViewSet):
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [IsStaffUserEditOnly]
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = SubscriberCalendarsFilter

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Calendar.objects.filter(
                Q(display='public') |
                (
                    Q(permissions__role=self.request.user.role) &
                    Q(permissions__group__user=self.request.user)
                ),
            )
        else:
            return Calendar.objects.filter(display='public')

    def get_serializer_class(self):
        if self.action.endswith('subscribe'):
            return SubscribeCalendarSerializer

        return super().get_serializer_class()

    @action(['POST'], False, permission_classes=[IsAuthenticated])
    def subscribe(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.data['calendars']
        calendars = Calendar.objects.filter(id__in=ids)
        self.request.user.calendar_set.add(*calendars)

        res_serializer = CalendarSerializer(
            self.request.user.calendar_set.all(),
            many=True,
        )

        return Response(res_serializer.data)

    @action(['POST'], False, permission_classes=[IsAuthenticated])
    def unsubscribe(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.data['calendars']
        calendars = Calendar.objects.filter(id__in=ids)
        self.request.user.calendar_set.remove(*calendars)

        res_serializer = CalendarSerializer(
            self.request.user.calendar_set.all(),
            many=True,
        )

        return Response(res_serializer.data)
