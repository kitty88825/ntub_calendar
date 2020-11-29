import json
import datetime

from .models import TelegramBot
from django.db.models import Q
from app.events.models import Event, EventParticipant
from app.users.models import User
from .serializers import GetSerializer, MeetingSerializer


def today(bot):
    user = list(TelegramBot.objects.values_list('user_id', flat=True).all())
    for u in user:
        chat_id = list(TelegramBot.objects.values_list('chat_id', flat=True).filter(user_id=u))
        event = Event.objects.filter(
            subscribers=u,
            start_at__contains=datetime.date.today()
        )
        calendar = Event.objects.filter(
            Q(calendars__subscribers=u) &
            (
                Q(start_at__contains=datetime.date.today()) |
                Q(end_at__contains=datetime.date.today())
            )

        )
        serializer = GetSerializer(event, many=True)
        serializer_calendar = GetSerializer(calendar, many=True)
        data_event = json.loads(json.dumps(serializer.data))
        data_calendar = json.loads(json.dumps(serializer_calendar.data))
        data = data_event + data_calendar

        if data:
            for i in data:
                i['行程'] = i.pop('title')
                i['開始時間'] = i.pop('start_at').replace('T', ' ').replace('+08:00', '')  # noqa 501
                i['結束時間'] = i.pop('end_at').replace('T', ' ').replace('+08:00', '')  # noqa 501
                i['備註'] = i.pop('description')
                i['地點'] = i.pop('location')

            data = json.dumps(data, ensure_ascii=False)
            data = data.replace('"', '')
            data = data.replace('[', '')
            data = data.replace(']', '')
            data = data.split('}, {')

            bot.send_message(chat_id[0], '今日行程:\n')

            for i in data:
                i = i.replace('{', '')
                i = i.replace('}', '')
                i = i.replace(',', '\n')
                bot.send_message(chat_id[0], i)
        else:
            bot.send_message(chat_id[0], '今日沒有行程~')


def invite_meeting(bot):
    chat_id = update.message.chat.id
    get_id = TelegramBot.objects.values_list('user_id', flat=True).filter(chat_id=chat_id)  # noqa 501
    if get_id:
        meeting = EventParticipant.objects.filter(
            Q(user=get_id[0]) &
            (
                Q(response='accept') |
                Q(response='maybe') |
                Q(response='no_reply')
            )
            ).distinct()

        serializer = MeetingSerializer(meeting, many=True)
        data = json.loads(json.dumps(serializer.data))
        for i in data:
            i['行程'] = i.pop('event')
            i['是否參加'] = i.pop('response')
            if i['是否參加'] == 'accept':
                i['是否參加'] = '是'
            elif i['是否參加'] == 'maybe':
                i['是否參加'] = '不確定'
            elif i['是否參加'] == 'no_reply':
                i['是否參加'] = '未回應'

        data = json.dumps(data, ensure_ascii=False)
        data = data.replace('"', '')
        data = data.replace('[', '')
        data = data.replace(']', '')
        data = data.split('}, {')
        for i in data:
            i = i.replace('{', '')
            i = i.replace('}', '')
            i = i.replace(',', '\n')
            context.bot.send_message(chat_id, i)
    else:
        context.bot.send_message(chat_id, '您尚未登入無法使用此功能😢')
