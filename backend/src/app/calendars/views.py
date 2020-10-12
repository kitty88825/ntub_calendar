from django.db.models import Q

from rest_framework.viewsets import ModelViewSet

from django_filters import rest_framework as filters

from .models import Calendar
from .serializers import CalendarSerializer
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
            return Calendar.objects \
                .filter(
                    Q(permissions__group__user=self.request.user.id) |
                    Q(display='public'),
                ) \
                .distinct()
        else:
            return Calendar.objects.filter(display='public')
