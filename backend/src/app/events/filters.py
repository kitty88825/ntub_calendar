from django_filters import rest_framework as filters

from .models import Event


class SubscriberEventsFilter(filters.FilterSet):
    subscribed = filters.BooleanFilter(
        field_name='subscribers',
        method='filter_subscribed',
    )

    class Meta:
        model = Event
        fields = ['subscribed', 'nature']

    def filter_subscribed(self, queryset, name, value):
        if not value or not self.request.user.is_authenticated:
            return queryset

        return queryset.filter(**{name: self.request.user.id})
