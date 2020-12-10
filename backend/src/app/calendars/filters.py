from django.db.models import Q

from django_filters import rest_framework as filters

from .models import Calendar
from .choices import AuthorityChoice


class SubscriberCalendarsFilter(filters.FilterSet):
    subscribed = filters.BooleanFilter(
        field_name='subscribers',
        method='filter_subscribed',
    )

    permission = filters.BooleanFilter(
        field_name='groups',
        method='filter_permission',
    )

    class Meta:
        model = Calendar
        fields = ['subscribed', 'permission']

    def filter_subscribed(self, queryset, name, value):
        if not value or not self.request.user.is_authenticated:
            return queryset

        return queryset.filter(**{name: self.request.user.id})

    def filter_permission(self, queryset, name, value):
        if not value or not self.request.user.is_authenticated:
            return queryset.filter(name='')

        return queryset \
            .filter(
                Q(permissions__role=self.request.user.role),
                Q(permissions__group__user=self.request.user),
                Q(permissions__authority=AuthorityChoice.write)) \
            .distinct()
