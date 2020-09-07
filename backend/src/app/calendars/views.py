from rest_framework.viewsets import ModelViewSet

from .models import Calendar
from .serializers import CalendarSerializer
from .permission import IsStaffUserEditOnly


class CalendarViewSet(ModelViewSet):
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [IsStaffUserEditOnly]
