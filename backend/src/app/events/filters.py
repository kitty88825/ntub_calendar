import calendar

from django_filters import rest_framework as filters

from .models import Event


class SubscriberEventsFilter(filters.FilterSet):
    subscribed = filters.BooleanFilter(
        field_name='subscribers',
        method='filter_subscribed',
    )
    time = filters.DateTimeFilter(
        field_name='start_at',
        method='filter_time',
    )

    class Meta:
        model = Event
        fields = ['subscribed', 'nature', 'time']

    def filter_subscribed(self, queryset, name, value):
        if not value or not self.request.user.is_authenticated:
            return queryset

        return queryset.filter(**{name: self.request.user.id})

    def filter_time(self, queryset, name, value):
        start = value
        month_end = calendar.monthrange(value.year, start.month)[1]
        end = value.replace(day=month_end)

        return queryset.filter(start_at__range=[start, end])
