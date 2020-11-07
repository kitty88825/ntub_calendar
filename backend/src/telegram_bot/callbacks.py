import logging

from app.events.models import Event
from django.core import serializers

# Set logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def get_event(update, context):
    chat_id = update.message.chat.id
    # event = Event.objects.values('title', 'start_at', 'end_at', 'description', 'location')  # noqa 501
    event = Event.objects.all()
    data = serializers.serialize("json", event)
    context.bot.send_message(chat_id, data)
