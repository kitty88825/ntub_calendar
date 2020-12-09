import icalendar

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
        attendee_list = list()
        participants = item.participants.all()
        default_attendee_params = {
            "cutype": icalendar.vText("INDIVIDUAL"),  # 日曆的使用者
            "rsvp": icalendar.vText("TRUE"),  # 參與者回覆
            "role": icalendar.vText("REQ-PARTICIPANT"),  # 參與者角色
        }

        for participant in participants:
            attendee = icalendar.vCalAddress(f"MAILTO:{participant.email}")
            participant_dic = default_attendee_params.copy()
            try:
                response = item.participants.through.objects \
                    .values_list('response', flat=True) \
                    .get(user=participant)
            except Exception as error:
                print(f'Feed item.participants.through.objects.get{error}')

            # 參與者邀請回覆
            if response == 'accept':
                attendee.params['partstat'] = icalendar.vText("ACCEPTED")
            elif response == 'decline':
                attendee.params['partstat'] = icalendar.vText("DECLINED")
            else:
                attendee.params['partstat'] = icalendar.vText("NEEDS-ACTION")

            for key, val in participant_dic.items():
                attendee.params[key] = icalendar.vText(val)
            attendee_list.append(attendee)

        return attendee_list
