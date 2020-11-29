import logging
import json
import datetime

from datetime import datetime as dt

from django.db.models import Q
from django.utils import timezone

from app.events.models import Event, EventParticipant
from app.users.models import User
from app.calendars.models import Calendar

from .models import TelegramBot
from .serializers import GetSerializer, CalendarSerializer, MeetingDetailSerializer

from telegram import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton


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
        '歡迎使用一訂行☺️請先登入來獲得所有的功能！沒有登入的話大部份功能皆無法使用🙁登入請輸入 /login 你的訂閱網址\nEX: /login http://127.0.0.1/feed/12345'  # noqa 501
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

    search = text_after_command(update)
    event = None
    if get_id:
        if not search:
            event = Event.objects \
                .filter(
                    Q(calendars__groups__user=get_id[0]) &
                    (
                        Q(start_at__year__gte=datetime.date.today().year) &
                        Q(start_at__month__gte=datetime.date.today().month) &
                        Q(start_at__day__gte=datetime.date.today().day)
                    ) |
                    Q(participants=get_id[0]) &
                    (
                        Q(start_at__year__gte=datetime.date.today().year) &
                        Q(start_at__month__gte=datetime.date.today().month) &
                        Q(start_at__day__gte=datetime.date.today().day)
                    )
                ) \
                .distinct()
        else:
            event = Event.objects \
                .filter(
                    Q(calendars__groups__user=get_id[0]) &
                    (
                        Q(title__contains=search) &
                        Q(start_at__year__gte=datetime.date.today().year) &
                        Q(start_at__month__gte=datetime.date.today().month) &
                        Q(start_at__day__gte=datetime.date.today().day)
                    ) |
                    Q(participants=get_id[0]) &
                    (
                        Q(title__contains=search) &
                        Q(start_at__year__gte=datetime.date.today().year) &
                        Q(start_at__month__gte=datetime.date.today().month) &
                        Q(start_at__day__gte=datetime.date.today().day)
                    )
                ).distinct()
            print(event)
            if not event:
                context.bot.send_message(chat_id, '沒有搜尋到相關行程或會議🤔')
    else:
        event = Event.objects.filter(calendars__display='public').distinct()
        print('='*30)
    if event:

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
    else:
        context.bot.send_message(chat_id, '您暫時沒有行程唷😌')


def meeting(update, context):
    chat_id = update.message.chat.id
    get_id = TelegramBot.objects.filter(chat_id=chat_id)

    meeting = Event.objects.filter(
        Q(nature='meeting') &
        Q(eventparticipant__user_id=get_id[0].user_id) &
        (
            Q(start_at__year__gte=datetime.date.today().year) &
            Q(start_at__month__gte=datetime.date.today().month) &
            Q(start_at__day__gte=datetime.date.today().day)
        )
    )
    if meeting:
        serializer = MeetingDetailSerializer(meeting, many=True)
        data = json.loads(json.dumps(serializer.data))

        for i in data:
            # event_id = i.pop('id')
            i['行程'] = i.pop('title')
            i['開始時間'] = i.pop('start_at').replace('T', ' ').replace('+08:00', '')
            i['結束時間'] = i.pop('end_at').replace('T', ' ').replace('+08:00', '')
            i['備註'] = i.pop('description')
            i['地點'] = i.pop('location')
            i['參與人員'] = i.pop('eventparticipant_set')
            # print(i['參與人員'] )
            # print(type(i['參與人員']))

            # for a in i['參與人員'] :
            #     if a['user'] == User.objects.get(id=get_id[0].user_id).emails and a['response'] == 'no_reply'

            i = json.dumps(i, ensure_ascii=False)
            i = i.replace('"', '')
            i = i.replace('[', '')
            i = i.replace(']', '')
            i = i.replace('}', '')
            i = i.replace('{', '')
            i = i.replace("user:", '')
            i = i.replace('editors', '(會議發起人)')
            i = i.replace('role:', '')
            i = i.replace('participants', '')
            i = i.replace( ", response:",':')
            i = i.replace('accept', '參加')
            i = i.replace('maybe', '不確定')
            i = i.replace('no_reply', '未回應')
            i = i.replace('decline', '不參加')
            i = i.replace(',', '\n')

            keyboard = [
                [InlineKeyboardButton('修改出席狀態', callback_data='1')]
            ]

            reply_markup = InlineKeyboardMarkup(keyboard)
            context.bot.send_message(chat_id=chat_id, text=i, reply_markup=reply_markup)

    else:
        context.bot.send_message(chat_id, '目前沒有已參與會議~')


def meeting_callback(update, context):
    chat_id = update.callback_query.message.chat_id
    text = update.callback_query.message.text
    text = text.replace('行程:', '')
    text = text.replace('開始時間:', '')
    text = text.replace('結束時間:', '')
    text = text.replace('備註:', '')
    text = text.replace('地點:', '')
    text = text.replace('參與人員:', '')
    text = text.replace(' ', '')
    text = text.replace('(會議發起人)', '')
    text = text.replace('不參加:', '')
    text = text.replace('參加', '')
    text = text.replace('不確定:', '')

    text = text.split('\n')
    event = Event.objects.filter(
        Q(title=text[0]) &
        Q(start_at__date=dt.strptime(text[1], '%Y-%m-%d%H:%M:%S')) &
        Q(end_at__date=dt.strptime(text[2], '%Y-%m-%d%H:%M:%S'))
    )
    query = update.callback_query.data
    if query == '1':
        reply_markup = InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton('參加', callback_data='2'),
                    InlineKeyboardButton('不確定', callback_data='3'),
                    InlineKeyboardButton('不參加', callback_data='4')
                ]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )

    elif query == '2':
        user = TelegramBot.objects.filter(chat_id=chat_id)
        reply = EventParticipant.objects.filter(
            Q(event_id=event[0].id) &
            Q(user=user[0].user_id)
        )
        reply.update(response='accept')
        reply_markup = InlineKeyboardMarkup(
            [
                [InlineKeyboardButton('已修改出席狀態爲參加', callback_data='5')]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )
        context.bot.send_message(chat_id, '已幫您修改出席狀態爲參加')

    elif query == '3':
        user = TelegramBot.objects.filter(chat_id=chat_id)
        reply = EventParticipant.objects.filter(
            Q(event_id=event[0].id) &
            Q(user=user[0].user_id)
        )
        reply.update(response='maybe')
        reply_markup = InlineKeyboardMarkup(
            [
                [InlineKeyboardButton('已修改出席狀態爲不確定', callback_data='5')]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )
        context.bot.send_message(chat_id, '已幫您修改出席狀態爲不確定')

    elif query == '4':
        user = TelegramBot.objects.filter(chat_id=chat_id)
        reply = EventParticipant.objects.filter(
            Q(event_id=event[0].id) &
            Q(user=user[0].user_id)
        )
        reply.update(response='decline')
        reply_markup = InlineKeyboardMarkup(
            [
                [InlineKeyboardButton('已修改出席狀態爲不參加', callback_data='5')]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )
        context.bot.send_message(chat_id, '已幫您修改出席狀態爲參加')


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
