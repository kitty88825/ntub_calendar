import calendar

from dateutil.relativedelta import relativedelta

from django_filters import rest_framework as filters

from .models import Event


class SubscriberEventsFilter(filters.FilterSet):
    subscribed = filters.BooleanFilter(
        field_name='subscribers',
        method='filter_subscribed',
    )
    month = filters.DateTimeFilter(
        field_name='start_at',
        method='filter_month',
    )
    study_years = filters.DateTimeFilter(method='filter_study_years')
    semester = filters.DateTimeFilter(method='filter_semester')

    class Meta:
        model = Event
        fields = ['subscribed', 'nature', 'month', 'study_years', 'semester']

    def filter_subscribed(self, queryset, name, value):
        if not value or not self.request.user.is_authenticated:
            return queryset

        return queryset.filter(**{name: self.request.user.id})

    def filter_month(self, queryset, name, value):
        start = value
        month_end = calendar.monthrange(value.year, start.month)[1]
        end = value.replace(day=month_end)

        return queryset.filter(start_at__range=[start, end])

    def filter_study_years(self, queryset, name, value):
        start = value
        end = value + relativedelta(months=+12)
        month_end = calendar.monthrange(end.year, end.month)[1]
        end = end.replace(day=month_end)

        return queryset.filter(start_at__range=[start, end])

    def filter_semester(self, queryset, name, value):
        month_end = calendar.monthrange(value.year, value.month)[1]
        end = value.replace(day=month_end)

        return queryset.filter(start_at__lte=end)
