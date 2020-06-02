from django.contrib.auth.models import Group

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from app.users.models import User

from .models import Calendar, Permission, Subscription
from .serializers import CalendarSerializer
from .serializers import SubscriptionSerializer
from .permission import IsStaffUserEditOnly


class CalendarViewSet(ModelViewSet):
    serializer_class = CalendarSerializer
    permission_classes = [IsStaffUserEditOnly]
    queryset = Calendar.objects.all()

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        group_id = list(user.groups.values_list('id', flat=True))
        group = list(Group.objects.values_list('name', flat=True).filter(id__in=group_id))  # noqa 501
        calendar_id = list(Permission.objects.values_list('calendar_id', flat=True).filter(group_id__in=group_id))  # noqa 501
        queryset = Calendar.objects.filter(id__in=calendar_id)
        return queryset


class SubscriptionViewSet(ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Subscription.objects.all()

    def perform_create(self, serializers):
        serializers.save(user=self.request.user)
