from telegram import Bot as TelegramBot, Update
from telegram.ext import Dispatcher, CommandHandler, CallbackQueryHandler, MessageHandler, Filters, Updater  # noqa 501

import environ

from . import callbacks
from . import task

env = environ.Env()


def webhook_handler(data):
    bot = TelegramBot(env('TG_TOKEN'))
    dispatcher = Dispatcher(bot, None)

    # Handlers
    dispatcher.add_handler(CommandHandler('start', callbacks.start))
    dispatcher.add_handler(CommandHandler('event', callbacks.get_event))
    dispatcher.add_handler(CommandHandler('login', callbacks.login))
    dispatcher.add_handler(CommandHandler('meeting', callbacks.meeting))
    dispatcher.add_handler(CommandHandler('subscribe', callbacks.calendar))
    dispatcher.add_handler(MessageHandler(Filters.text, callbacks.calendarSubscribe))  # noqa 501
    dispatcher.add_handler(CallbackQueryHandler(callbacks.meeting_callback))


    # Process update
    update = Update.de_json(data, bot)
    dispatcher.process_update(update)


def auto_message():
    bot = TelegramBot(env('TG_TOKEN'))
    task.today(bot)


def auto_invite(event_id, user_id):
    bot = TelegramBot(env('TG_TOKEN'))
    task.invite_meeting(bot, event_id, user_id)
