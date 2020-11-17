import logging
import json

from app.events.models import Event
from app.users.models import User

from .models import TelegramBot
from .serializers import GetSerializer


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
    if not reply:
        context.bot.send_message(chat_id, '沒有網址沒辦法登入唷🙁，登入請輸入 /login 你的訂閱url')
    else:
        reply_list = reply.split('/')
        reply = reply_list[4]
        user_id = User.objects.values_list('id', flat=True).filter(code=reply)
        TelegramBot.objects.get_or_create(
            chat_id=chat_id,
            user_id=user_id[0]
        )
        context.bot.send_message(chat_id, '登入成功！開始使用一訂行吧🥰，使用 /help 來查看所有功能👉')


def get_event(update, context):
    chat_id = update.message.chat.id
    # .strftime('%Y/%m/%d %H:%M')
    event = Event.objects.values()
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
    data = data.replace('{', '')
    data = data.replace('}', '')

    context.bot.send_message(chat_id, data.replace(',', '\n'))
    # context.bot.send_message(chat_id, data)
