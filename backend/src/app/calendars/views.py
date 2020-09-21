from django.db.models import Q

from rest_framework.viewsets import ModelViewSet

from .models import Calendar
from .serializers import CalendarSerializer
from .permission import IsStaffUserEditOnly


class CalendarViewSet(ModelViewSet):
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [IsStaffUserEditOnly]

    def get_queryset(self):
        if self.request.user.id:
            return Calendar.objects \
                .filter(
                    Q(permissions__group__user=self.request.user.id) |
                    Q(display='public'),
                ) \
                .distinct()
        else:
            return Calendar.objects.filter(display='public')
