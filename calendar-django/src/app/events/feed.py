from django_ical.views import ICalFeed

from .models import Event


class EventFeed(ICalFeed):
    """
    A simple event calender
    """
    product_id = '-//NTUB Calendar//kitty//TW'
    timezone = 'UTC+8'
    file_name = "event.ics"

    def items(self):
        return Event.objects.all()

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.description

    def item_start_datetime(self, item):
        return item.start_at

    def item_link(self, item):
        return item.link()
