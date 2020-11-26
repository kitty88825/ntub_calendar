import logging
import json
import datetime

from django.db.models import Q
from django.utils import timezone

from app.events.models import Event, EventParticipant
from app.users.models import User
from app.calendars.models import Calendar

from .models import TelegramBot
from .serializers import GetSerializer, MeetingSerializer, CalendarSerializer

from telegram import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove


# timezone
timezone.now()

# Set logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def text_after_command(update):
    text = update.message.text
    entities = update.message.entities
    command_len = entities[0]['offset'] + entities[0]['length'] + 1
    return text[command_len:] if len(text) > command_len else ''


def start(update, context):
    chat_id = update.message.chat.id
    context.bot.send_message(
        chat_id,
        '歡迎使用一訂行☺️請先登入來獲得所有的功能！沒有登入的話只能查看公開行程而已🙁登入請輸入 /login 你的訂閱url'  # noqa 501
        )


def login(update, context):
    chat_id = update.message.chat.id
    reply = text_after_command(update)
    get_id = TelegramBot.objects.filter(chat_id=chat_id)
    if get_id:
        context.bot.send_message(chat_id, '您已經登入完成囉🤗不用再重新登入~')
    else:
        if not reply:
            context.bot.send_message(chat_id, '沒有網址沒辦法登入唷🙁，登入請輸入 /login 你的訂閱網址(URL)')  # noqa 501
        else:
            reply_list = reply.split('/')
            reply = reply_list[4]
            user_id = User.objects.values_list('id', flat=True).filter(code=reply)  # noqa 501
            TelegramBot.objects.get_or_create(
                chat_id=chat_id,
                user_id=user_id[0]
            )
            context.bot.send_message(
                chat_id,
                '登入成功！歡迎{}！🥰如果之後您更換了訂閱網址(URL)，不需要重新登入喔！接下來使用 / 來查看所有功能吧👉'.format(update.message.chat.first_name)  # noqa 501
                )


def get_event(update, context):
    chat_id = update.message.chat.id
    get_id = TelegramBot.objects.values_list('user_id', flat=True).filter(chat_id=chat_id)  # noqa 501
    event = None
    if get_id:
        event = Event.objects \
            .filter(
                Q(calendars__groups__user=get_id[0]) |
                Q(calendars__display='public') |
                Q(participants=get_id[0]),
            ) \
            .distinct()
    else:
        event = Event.objects.filter(calendars__display='public').distinct()

    serializer = GetSerializer(event, many=True)

    data = json.loads(json.dumps(serializer.data))

    for i in data:
        i['行程'] = i.pop('title')
        i['開始時間'] = i.pop('start_at').replace('T', ' ').replace('+08:00', '')
        i['結束時間'] = i.pop('end_at').replace('T', ' ').replace('+08:00', '')
        i['備註'] = i.pop('description')
        i['地點'] = i.pop('location')

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


def meeting(update, context):
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


def calendar(update, context):
    chat_id = update.message.chat.id
    user_id = list(TelegramBot.objects.values_list('user_id', flat=True).filter(chat_id=chat_id))  # noqa 501
    user = User.objects.filter(id__in=user_id)
    if user:
        calendar = Calendar.objects.filter(
            Q(display='public') |
            (
                Q(permissions__role=user[0].role) &
                Q(permissions__group__user=user[0])
            ),
        ).exclude(subscribers__in=user_id).distinct()
        if calendar:

            serializer = CalendarSerializer(calendar, many=True)
            data = json.dumps(serializer.data, ensure_ascii=False)

            data = data.replace('"', '')
            data = data.replace('[', '')
            data = data.replace(']', '')
            data = data.replace('}', '')
            data = data.replace('{', '')
            data = data.replace(':', '')
            data = data.replace('name', '')
            data = data.replace(' ', '')
            data = data.split(',')
            keyboard = [
                [KeyboardButton(text='結束訂閱')],
            ]

            for i in data:
                keyboard.append([KeyboardButton(text=i)])

            reply_markup = ReplyKeyboardMarkup(
                keyboard,
                resize_keyboard=True,
            )
            context.bot.send_message(
                chat_id=chat_id,
                text='點選想訂閱的行事曆',
                reply_markup=reply_markup,
                )
        else:
            context.bot.send_message(chat_id, '行事曆都已訂閱，沒有可以訂閱的行事曆了')
    else:
        context.bot.send_message(chat_id, '您尚未登入無法使用此功能😢')


def calendarSubscribe(update, context):
    chat_id = update.message.chat.id
    user_id = list(TelegramBot.objects.values_list('user_id', flat=True).filter(chat_id=chat_id))  # noqa 501
    user = User.objects.filter(id__in=user_id)
    text = update.message.text
    calendar = Calendar.objects.filter(
            Q(display='public') |
            (
                Q(permissions__role=user[0].role) &
                Q(permissions__group__user=user[0])
            ),
        ).exclude(subscribers__in=user_id).distinct()
    serializer = CalendarSerializer(calendar, many=True)
    data = json.dumps(serializer.data, ensure_ascii=False)
    if text in data:
        c = Calendar.objects.filter(name=text)
        c[0].subscribers.add(user[0].id)
        context.bot.send_message(chat_id, '已訂閱此行事曆😉')
    elif text == '結束訂閱':
        context.bot.send_message(chat_id, text='如過想再訂閱請用 /calendar', reply_markup=ReplyKeyboardRemove())


def today(bot):
    chat_id = list(TelegramBot.objects.values_list('chat_id', flat=True))

    user = list(TelegramBot.objects.values_list('user_id', flat=True).all())
    for c in chat_id:
        for u in user:
            event = Event.objects.filter(
                subscribers=u,
                start_at__contains=datetime.date.today()
            )
            calendar = Event.objects.filter(
                Q(calendars__subscribers=u) &
                Q(start_at__contains=datetime.date.today())
            )
            serializer = GetSerializer(event, many=True)
            serializer_calendar = GetSerializer(calendar, many=True)
            data_event = json.loads(json.dumps(serializer.data))
            data_calendar = json.loads(json.dumps(serializer_calendar.data))
            data = data_event + data_calendar

            if data.count() != 0:
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

                bot.send_message(c, '今日行程:\n')

                for i in data:
                    i = i.replace('{', '')
                    i = i.replace('}', '')
                    i = i.replace(',', '\n')
                    bot.send_message(c, i)
            else:
                bot.send_message(c, '今日沒有行程~')
