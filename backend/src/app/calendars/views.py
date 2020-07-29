from django.db.models import Q

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Calendar, Subscription
from .serializers import (
    CalendarSerializer,
    SubscriptionSerializer,
    SubscriptionCreateSerializer,
)
from .permission import IsStaffUserEditOnly


class CalendarViewSet(ModelViewSet):
    serializer_class = CalendarSerializer
    permission_classes = [IsStaffUserEditOnly]
    queryset = Calendar.objects.all()

    def get_queryset(self):
        if self.request.user.id:
            return Calendar.objects \
                .filter(
                    Q(permission__group__user=self.request.user.id),
                )


class SubscriptionViewSet(ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Subscription.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return SubscriptionCreateSerializer

        return super().get_serializer_class()

    def perform_create(self, serializers):
        serializers.save(user=self.request.user)
