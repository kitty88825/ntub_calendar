import logging
import json
import datetime

from datetime import datetime as dt
from textwrap import dedent

from django.db.models import Q
from django.utils import timezone

from app.events.models import Event, EventParticipant
from app.users.models import User
from app.calendars.models import Calendar

from .models import TelegramBot
from .serializers import GetSerializer, CalendarSerializer, MeetingDetailSerializer  # noqa 501

from telegram import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton  # noqa 501


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


def event_handle(i):
    calendar_id = ''.join(str(c) for c in i['calendars'])
    calendar = Calendar.objects.filter(id=calendar_id)
    i['calendars'] = calendar[0].name
    i['行程'] = i.pop('title')
    i['開始時間'] = i.pop('start_at').replace('T', ' ').replace('+08:00', '')
    i['結束時間'] = i.pop('end_at').replace('T', ' ').replace('+08:00', '')
    i['備註'] = i.pop('description')
    i['地點'] = i.pop('location')
    i['行事曆'] = i.pop('calendars')

    i = json.dumps(i, ensure_ascii=False)
    i = i.replace('"', '')
    i = i.replace('[', '')
    i = i.replace(']', '')
    i = i.replace('id:', '')
    i = i.replace('{', '')
    i = i.replace('}', '')
    i = i.replace(',', '\n')
    return i


def start(update, context):
    chat_id = update.message.chat.id
    context.bot.send_message(
        chat_id,
        dedent('''\
        歡迎使用一訂行☺️請先進行身分綁定來獲得所有的功能！
        沒有綁定的話大部份功能皆無法使用🙁欲綁定請輸入 /login 你的訂閱網址
        訂閱網址請在本系統網頁服務中的"我的訂閱"中獲取
        ''')
    )
    context.bot.send_message(
        chat_id,
        dedent('''\
        範例:/login https://calendar.ntub.tw//feed/3ce855c-8f65-8c8949365f34
        網頁服務請到
        https://fir-project-44c79.firebaseapp.com/#/
        '''),
    )


def help(update, context):
    chat_id = update.message.chat.id
    context.bot.send_message(
        chat_id=chat_id,
        text=dedent('''\
            /login - 貼上你的訂閱網址  »綁定並開始使用一訂行！
            /help - 查看所有功能
            /website - 前往一訂行網頁服務
            /event - 接上關鍵字來搜尋特定行程!
            /meeting - 查看今日會議或是以關鍵字來搜尋會議
            /subscribe - 訂閱行事曆
        '''),
    )


def website(update, context):
    chat_id = update.message.chat.id
    keyboard = [
        [InlineKeyboardButton('GO!', url='https://fir-project-44c79.firebaseapp.com/#/')]  # noqa 501
    ]
    context.bot.send_message(
        chat_id=chat_id,
        text='點選按鈕前往一訂行網頁服務',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


def login(update, context):
    chat_id = update.message.chat.id
    reply = text_after_command(update)
    get_id = TelegramBot.objects.filter(chat_id=chat_id)
    if get_id:
        context.bot.send_message(chat_id, '您已經綁定完成囉🤗不用再重新綁定~')
    else:
        if not reply:
            context.bot.send_message(chat_id, '沒有網址沒辦法綁定唷🙁，綁定請輸入 /login 你的訂閱網址(URL)')  # noqa 501
        else:
            reply_list = reply.split('/')
            reply = reply_list[4]
            user_id = User.objects.values_list('id', flat=True).filter(code=reply)  # noqa 501
            if user_id:
                TelegramBot.objects.get_or_create(
                    chat_id=chat_id,
                    user_id=user_id[0]
                )
                context.bot.send_message(
                    chat_id,
                    f'綁定成功！歡迎{update.message.chat.first_name}！🥰如果之後您更換了訂閱網址，不需要重新綁定喔！接下來使用 /help 來查看所有功能吧👉'  # noqa 501
                    )
            else:
                context.bot.send_messag(
                    chat_id,
                    '沒有找到符合訂閱網址的使用者，您是否已經更換過網址或是尚未在一訂行網頁登入呢?'
                )


def get_event(update, context):
    chat_id = update.message.chat.id
    get_id = TelegramBot.objects.values_list('user_id', flat=True).filter(chat_id=chat_id)  # noqa 501

    search = text_after_command(update)
    event = None
    if get_id:
        if not search:
            context.bot.send_message(chat_id, '接上關鍵字才能查詢')
        else:
            event = Event.objects \
                .filter(
                    Q(calendars__groups__user=get_id[0]) &
                    (
                        Q(title__contains=search) &
                        Q(start_at__gte=datetime.date.today())
                    ) |
                    Q(participants=get_id[0]) &
                    (
                        Q(title__contains=search) &
                        Q(start_at__gte=datetime.date.today())
                    ) |
                    Q(calendars__display='public') &
                    (
                        Q(title__contains=search) &
                        Q(start_at__gte=datetime.date.today())
                    )
                ).distinct()
            if not event:
                context.bot.send_message(chat_id, '沒有搜尋到相關行程或會議🤔')

            if event:
                serializer = GetSerializer(event, many=True)

                data = json.loads(json.dumps(serializer.data))
                for i in data:
                    event_id = i.pop('id')
                    i = event_handle(i)
                    keyboard = [
                        [InlineKeyboardButton('單獨訂閱此行程', callback_data=event_id)],
                    ]
                    context.bot.send_message(
                        chat_id=chat_id,
                        text=i,
                        reply_markup=InlineKeyboardMarkup(keyboard)
                    )

                context.bot.send_message(chat_id, '以上是這次的查詢結果🥰')
    else:
        context.bot.send_message(chat_id, '請先綁定!')


def meeting_handle(i):
    i['行程'] = i.pop('title')
    i['開始時間'] = i.pop('start_at').replace('T', ' ').replace('+08:00', '')
    i['結束時間'] = i.pop('end_at').replace('T', ' ').replace('+08:00', '')
    i['備註'] = i.pop('description')
    i['地點'] = i.pop('location')
    i['參與人員'] = i.pop('eventparticipant_set')

    i = json.dumps(i, ensure_ascii=False)
    i = i.replace('"', '')
    i = i.replace('[', '')
    i = i.replace(']', '')
    i = i.replace('}', '')
    i = i.replace('{', '')
    i = i.replace("user:", '')
    i = i.replace('editors, response: accept', '(發起人)')
    i = i.replace('editors, response: maybe', '(發起人)')
    i = i.replace('editors, response: no_reply', '(發起人)')
    i = i.replace('editors, response: decline', '(發起人)')
    i = i.replace(', role:', '')
    i = i.replace('participants', '')
    i = i.replace(", response:", ':')
    i = i.replace('accept', '參加')
    i = i.replace('maybe', '不確定')
    i = i.replace('no_reply', '未回應')
    i = i.replace('decline', '不參加')
    i = i.replace(',', '\n')
    return i


def meeting(update, context):
    chat_id = update.message.chat.id
    get_id = TelegramBot.objects.filter(chat_id=chat_id)
    search = text_after_command(update)
    if search:
        edit_meeting = Event.objects.filter(
            Q(nature='meeting'),
            Q(eventparticipant__user_id=get_id[0].user_id),
            Q(eventparticipant__role='editors'),
            Q(start_at__gte=datetime.date.today()),
            Q(title__contains=search),
        )
        attend_meeting = Event.objects.filter(
            Q(nature='meeting'),
            Q(eventparticipant__user_id=get_id[0].user_id),
            Q(eventparticipant__role='participants'),
            Q(start_at__gte=datetime.date.today()),
            Q(title__contains=search),
        )
    else:
        edit_meeting = Event.objects.filter(
            Q(nature='meeting'),
            Q(eventparticipant__user_id=get_id[0].user_id),
            Q(eventparticipant__role='editors'),
            Q(start_at__contains=datetime.date.today()),
        )
        attend_meeting = Event.objects.filter(
            Q(nature='meeting'),
            Q(eventparticipant__user_id=get_id[0].user_id),
            Q(eventparticipant__role='participants'),
            Q(start_at__contains=datetime.date.today()),
        )
    if edit_meeting or attend_meeting:
        if edit_meeting:
            serializer = MeetingDetailSerializer(edit_meeting, many=True)
            edit_data = json.loads(json.dumps(serializer.data))
            for i in edit_data:  # 使用者發起的會議
                i = meeting_handle(i)
            context.bot.send_message(chat_id, i)

        if attend_meeting:
            attend_serializer = MeetingDetailSerializer(attend_meeting, many=True)  # noqa 501
            attend_data = json.loads(json.dumps(attend_serializer.data))

            for i in attend_data:  # 使用者受邀的會議
                i = meeting_handle(i)

                keyboard = [
                    [InlineKeyboardButton('修改出席狀態', callback_data='edit_meeting')]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                context.bot.send_message(
                    chat_id=chat_id,
                    text=i,
                    reply_markup=reply_markup,
                )

        search_keyboard = [
            [InlineKeyboardButton('查詢其他時間區段的會議', callback_data='search')],
        ]
        context.bot.send_message(
            chat_id=chat_id,
            text='如果需要查詢其他日期的會議請點選以下按鈕',
            reply_markup=InlineKeyboardMarkup(search_keyboard),
        )
    else:
        search_keyboard = [
            [InlineKeyboardButton('查詢其他時間區段的會議', callback_data='search')],
        ]
        context.bot.send_message(
            chat_id=chat_id,
            text=dedent('''\
                    今日沒有需出席的會議~
                    如果需要查詢其他日期的會議請點選以下按鈕
                '''),
            reply_markup=InlineKeyboardMarkup(search_keyboard),
        )


def meeting_callback(update, context):
    query = update.callback_query.data

    chat_id = update.callback_query.message.chat_id

    if query == 'accept' or query == 'maybe' or query == 'decline':
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

    if query == 'edit_meeting':
        reply_markup = InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton('參加', callback_data='accept'),
                    InlineKeyboardButton('不確定', callback_data='maybe'),
                    InlineKeyboardButton('不參加', callback_data='decline')
                ]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )

    elif query == 'accept':
        user = TelegramBot.objects.filter(chat_id=chat_id)
        reply = EventParticipant.objects.filter(
            Q(event_id=event[0].id) &
            Q(user=user[0].user_id)
        )
        reply.update(response='accept')
        reply_markup = InlineKeyboardMarkup(
            [
                [InlineKeyboardButton('已修改出席狀態爲參加', callback_data='nothing')]
            ]
        )
        event = Event.objects.filter(id=event[0].id)

        serializer = MeetingDetailSerializer(event, many=True)
        data = json.loads(json.dumps(serializer.data))

        data[0] = meeting_handle(data[0])

        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )
        context.bot.send_message(chat_id, f'已幫您修改出席狀態爲參加:\n{data[0]}')

    elif query == 'maybe':
        user = TelegramBot.objects.filter(chat_id=chat_id)
        reply = EventParticipant.objects.filter(
            Q(event_id=event[0].id) &
            Q(user=user[0].user_id)
        )
        reply.update(response='maybe')

        event = Event.objects.filter(id=event[0].id)

        serializer = MeetingDetailSerializer(event, many=True)
        data = json.loads(json.dumps(serializer.data))

        data[0] = meeting_handle(data[0])

        reply_markup = InlineKeyboardMarkup(
            [
                [InlineKeyboardButton('已修改出席狀態爲不確定', callback_data='nothing')]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )
        context.bot.send_message(chat_id, f'已幫您修改出席狀態爲不確定:\n{data[0]}')

    elif query == 'decline':
        user = TelegramBot.objects.filter(chat_id=chat_id)
        reply = EventParticipant.objects.filter(
            Q(event_id=event[0].id) &
            Q(user=user[0].user_id)
        )
        reply.update(response='decline')

        event = Event.objects.filter(id=event[0].id)

        serializer = MeetingDetailSerializer(event, many=True)
        data = json.loads(json.dumps(serializer.data))

        data[0] = meeting_handle(data[0])

        reply_markup = InlineKeyboardMarkup(
            [
                [InlineKeyboardButton('已修改出席狀態爲不參加', callback_data='nothing')]
            ]
        )
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=reply_markup
        )
        context.bot.send_message(chat_id, f'已幫您修改出席狀態爲不參加\n{data[0]}')

    elif query == 'nothing':
        pass

    elif query == 'search':
        search_keyboard = [
            [InlineKeyboardButton('查看三天內的會議', callback_data='3天')],
            [InlineKeyboardButton('查看一個禮拜內的會議', callback_data='7天')],
            [InlineKeyboardButton('查看一個月內的會議', callback_data='30天')],
        ]
        context.bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=update.callback_query.message.message_id,
            reply_markup=InlineKeyboardMarkup(search_keyboard)
        )

    elif query == '3天':
        today = datetime.date.today()
        end = today + datetime.timedelta(days=3)
        user = TelegramBot.objects.filter(chat_id=chat_id)
        meeting = Event.objects.filter(
            Q(eventparticipant__user_id=user[0].user_id),
            Q(eventparticipant__role='editors'),
            Q(nature='meeting'),
            Q(start_at__range=[today, end]),
        )
        attend_meeting = Event.objects.filter(
            Q(eventparticipant__user_id=user[0].user_id),
            Q(eventparticipant__role='participants'),
            Q(nature='meeting'),
            Q(start_at__range=[today, end]),
        )
        if meeting or attend_meeting:
            if meeting:
                serializer = MeetingDetailSerializer(meeting, many=True)
                data = json.loads(json.dumps(serializer.data))
                for i in data:
                    i = meeting_handle(i)
                    context.bot.send_message(chat_id, i)

            if attend_meeting:
                attend_serializer = MeetingDetailSerializer(attend_meeting, many=True)
                attend_data = json.loads(json.dumps(attend_serializer.data))
                for i in attend_data:
                    i = meeting_handle(i)

                    keyboard = [
                        [InlineKeyboardButton('修改出席狀態', callback_data='edit_meeting')]
                    ]

                    context.bot.send_message(
                        chat_id=chat_id,
                        text=i,
                        reply_markup=InlineKeyboardMarkup(keyboard)
                    )
            context.bot.send_message(chat_id, '以上就是這三天的會議☺️')
        else:
            context.bot.send_message(chat_id, '這三天沒有受邀或是參與會議')

    elif query == '7天':
        today = datetime.date.today()
        end = today + datetime.timedelta(days=7)
        user = TelegramBot.objects.filter(chat_id=chat_id)
        meeting = Event.objects.filter(
            Q(eventparticipant__user_id=user[0].user_id),
            Q(eventparticipant__role='editors'),
            Q(nature='meeting'),
            Q(start_at__range=[today, end]),
        )
        attend_meeting = Event.objects.filter(
            Q(eventparticipant__user_id=user[0].user_id),
            Q(eventparticipant__role='participants'),
            Q(nature='meeting'),
            Q(start_at__range=[today, end]),
        )
        if meeting or attend_meeting:
            if meeting:
                serializer = MeetingDetailSerializer(meeting, many=True)
                data = json.loads(json.dumps(serializer.data))
                for i in data:
                    i = meeting_handle(i)
                    context.bot.send_message(chat_id, i)
            if attend_meeting:
                attend_serializer = MeetingDetailSerializer(attend_meeting, many=True)
                attend_data = json.loads(json.dumps(attend_serializer.data))
                for i in attend_data:
                    i = meeting_handle(i)

                    keyboard = [
                        [InlineKeyboardButton('修改出席狀態', callback_data='edit_meeting')]
                    ]

                    context.bot.send_message(
                        chat_id=chat_id,
                        text=i,
                        reply_markup=InlineKeyboardMarkup(keyboard)
                    )
            context.bot.send_message(chat_id, '以上就是最近七天的會議☺️')
        else:
            context.bot.send_message(chat_id, '最近七天沒有受邀或是參與會議')

    elif query == '30天':
        today = datetime.date.today()
        end = today + datetime.timedelta(days=31)
        user = TelegramBot.objects.filter(chat_id=chat_id)
        meeting = Event.objects.filter(
            Q(eventparticipant__user_id=user[0].user_id),
            Q(eventparticipant__role='editors'),
            Q(nature='meeting'),
            Q(start_at__range=[today, end]),
        )
        attend_meeting = Event.objects.filter(
            Q(eventparticipant__user_id=user[0].user_id),
            Q(eventparticipant__role='participants'),
            Q(nature='meeting'),
            Q(start_at__range=[today, end]),
        )
        if meeting or attend_meeting:
            if meeting:
                serializer = MeetingDetailSerializer(meeting, many=True)
                data = json.loads(json.dumps(serializer.data))
                for i in data:
                    i = meeting_handle(i)
                    context.bot.send_message(chat_id, i)
            if attend_meeting:
                attend_serializer = MeetingDetailSerializer(attend_meeting, many=True)
                attend_data = json.loads(json.dumps(attend_serializer.data))
                for i in attend_data:
                    i = meeting_handle(i)

                    keyboard = [
                        [InlineKeyboardButton('修改出席狀態', callback_data='edit_meeting')],
                    ]

                    context.bot.send_message(
                        chat_id=chat_id,
                        text=i,
                        reply_markup=InlineKeyboardMarkup(keyboard)
                    )
            context.bot.send_message(chat_id, '以上就是最近一個月的會議☺️')
        else:
            context.bot.send_message(chat_id, '最近一個月內沒有受邀或是參與會議')

    else:
        event_id = int(query)
        user_id = TelegramBot.objects.filter(chat_id=chat_id)
        user = User.objects.filter(id=user_id[0].user_id)
        event = Event.objects.filter(id=event_id).exclude(subscribers__in=user)
        if event:
            event[0].subscribers.add(user[0])
            keyboard = [
                [InlineKeyboardButton('已幫您訂閱此行程😊', callback_data='nothing')]
            ]
            context.bot.edit_message_reply_markup(
                chat_id=chat_id,
                message_id=update.callback_query.message.message_id,
                reply_markup=InlineKeyboardMarkup(keyboard),
            )
        else:
            keyboard = [
                [InlineKeyboardButton('這個行程已經訂閱過了😊', callback_data='nothing')]
            ]
            context.bot.edit_message_reply_markup(
                chat_id=chat_id,
                message_id=update.callback_query.message.message_id,
                reply_markup=InlineKeyboardMarkup(keyboard),
            )


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
        context.bot.send_message(chat_id, '您尚未綁定無法使用此功能😢')


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
        calendar = Calendar.objects.filter(subscribers__in=user_id).distinct()
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
            data = data.replace(',', '\n')
            context.bot.send_message(chat_id, text=f'已經訂閱的行事曆：\n{data}')

        context.bot.send_message(
            chat_id, text='如果想再訂閱請用 /subscribe',
            reply_markup=ReplyKeyboardRemove()
        )
