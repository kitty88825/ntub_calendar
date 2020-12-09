# Use the schedule wrapper
from django_q.models import Schedule
from django_q.tasks import async_task


def schedule(event_id):
    parameter = str(event_id)
    Schedule.objects.create(
        func='telegram_bot.bot.auto_invite',
        args=parameter,
        schedule_type=Schedule.ONCE,
    )


def send_email_task(event, user):
    async_task('app.events.functions.send_email', event, user)
