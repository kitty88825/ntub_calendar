from telegram import Bot as TelegramBot, Update
from telegram.ext import Dispatcher, CommandHandler, CallbackQueryHandler

import environ

from . import callbacks

env = environ.Env()


def webhook_handler(data):
    bot = TelegramBot(env('TG_TOKEN'))
    dispatcher = Dispatcher(bot, None)

    # Handlers
    dispatcher.add_handler(CommandHandler('start', callbacks.start))
    dispatcher.add_handler(CommandHandler('get', callbacks.get_event))
    dispatcher.add_handler(CommandHandler('login', callbacks.login))
    dispatcher.add_handler(CommandHandler('meeting', callbacks.meeting))
    dispatcher.add_handler(CommandHandler('calendar', callbacks.calendar))
    dispatcher.add_handler(CallbackQueryHandler(callbacks.calendarSubscribe))

    # Process update
    update = Update.de_json(data, bot)
    dispatcher.process_update(update)
