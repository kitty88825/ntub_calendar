from telegram import Bot as TelegramBot, Update
from telegram.ext import Dispatcher, CommandHandler, Updater

import environ

from . import callbacks

env = environ.Env()


def webhook_handler(data):
    bot = TelegramBot(env('TG_TOKEN'))
    dispatcher1 = Dispatcher(bot, None)



    # Handlers
    dispatcher1.add_handler(CommandHandler('start', callbacks.start))
    dispatcher1.add_handler(CommandHandler('get', callbacks.get_event))
    dispatcher1.add_handler(CommandHandler('login', callbacks.login))

    # Process update
    update = Update.de_json(data, bot)
    dispatcher1.process_update(update)

    # jobQueue
    updater = Updater(env('TG_TOKEN'), use_context=True)
    # job = updater.job_queue
    updater.dispatcher.add_handler(CommandHandler('timer', callbacks.callback_timer))  # noqa 501
    updater.dispatcher.add_handler(CommandHandler('sotp', updater.stop()))
