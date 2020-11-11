import logging
import json

from app.events.models import Event
from .serializers import GetSerializer


# Set logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def get_event(update, context):
    chat_id = update.message.chat.id
    # .strftime('%Y/%m/%d %H:%M')
    event = Event.objects.values()
    serializer = GetSerializer(event, many=True)

    data = json.loads(json.dumps(serializer.data, ensure_ascii=False))

    for i in data:
        i['行程'] = i.pop('title')
        i['開始時間'] = i.pop('start_at').replace('T', ' ').replace('+08:00', '')
        i['結束時間'] = i.pop('end_at').replace('T', ' ').replace('+08:00', '')
        i['備註'] = i.pop('description')
        i['地點'] = i.pop('location')

        print(i)

    data = json.dumps(data, ensure_ascii=False)
    print(type(data))

    context.bot.send_message(chat_id, data.replace(',', '\n'))
