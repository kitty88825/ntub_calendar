from django.db.models import Q

from django_ical.views import ICalFeed

from rest_framework.generics import get_object_or_404

from app.users.models import User
from core import settings

from .models import Event


class EventFeed(ICalFeed):
    """
    A simple event calender
    """
    product_id = '-//NTUB Calendar//kitty//TW'
    timezone = 'UTC+8'
    file_name = "event.ics"

    def get_object(self, request, code, *args, **kwargs):
        user = get_object_or_404(User, code=code)

        return Event.objects \
            .filter(
                Q(calendars__subscribers=user) |
                Q(eventparticipant__user=user) |
                Q(subscribers=user),
            ) \
            .distinct()

    def items(self, obj):
        return obj

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.description

    def item_start_datetime(self, item):
        return item.start_at

    def item_end_datetime(self, item):
        return item.end_at

    def item_location(self, item):
        return item.location

    def item_link(self, item):
        return f'{settings.FRONTEND_URL}{item.link}'

    def item_attendee(self, item):
        return item.participants.all()
