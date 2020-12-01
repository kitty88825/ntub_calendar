import json
import datetime

from .models import TelegramBot
from django.db.models import Q
from app.events.models import Event, EventParticipant
from app.users.models import User
from .serializers import GetSerializer, MeetingDetailSerializer
from telegram import InlineKeyboardMarkup, InlineKeyboardButton



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


def invite_meeting(bot, event_id):
    user = EventParticipant.objects.filter(
        Q(event_id=event_id),
        Q(role='participants')
    )
    for i in user:
        chat = TelegramBot.objects.filter(user_id=i.user_id)
        reply_markup = InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton('參加', callback_data='2'),
                        InlineKeyboardButton('不確定', callback_data='3'),
                        InlineKeyboardButton('不參加', callback_data='4')
                    ]
                ]
            )

        event = Event.objects.filter(id=event_id)
        serializer = MeetingDetailSerializer(event, many=True)
        data = json.loads(json.dumps(serializer.data))


        data[0]['行程'] = data[0].pop('title')
        data[0]['開始時間'] = data[0].pop('start_at').replace('T', ' ').replace('+08:00', '')
        data[0]['結束時間'] = data[0].pop('end_at').replace('T', ' ').replace('+08:00', '')
        data[0]['備註'] = data[0].pop('description')
        data[0]['地點'] = data[0].pop('location')
        data[0]['參與人員'] = data[0].pop('eventparticipant_set')

        data[0] = json.dumps(data[0], ensure_ascii=False)
        data[0] = data[0].replace('"', '')
        data[0] = data[0].replace('[', '')
        data[0] = data[0].replace(']', '')
        data[0] = data[0].replace('}', '')
        data[0] = data[0].replace('{', '')
        data[0] = data[0].replace("user:", '')
        data[0] = data[0].replace('editors', '(會議發起人)')
        data[0] = data[0].replace('role:', '')
        data[0] = data[0].replace('participants', '')
        data[0] = data[0].replace( ", response:",':')
        data[0] = data[0].replace('accept', '參加')
        data[0] = data[0].replace('maybe', '不確定')
        data[0] = data[0].replace('no_reply', '未回應')
        data[0] = data[0].replace('decline', '不參加')
        data[0] = data[0].replace(',', '\n')

        bot.send_message(chat[0].chat_id, '您收到一則會議邀請！')
        bot.send_message(chat_id=chat[0].chat_id, text=data[0], reply_markup=reply_markup)
