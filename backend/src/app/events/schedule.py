# Use the schedule wrapper
from django_q.models import Schedule


def schedule(event_id):
    parameter = str(event_id)
    Schedule.objects.create(
        func='telegram_bot.bot.auto_invite',
        args=parameter,
        schedule_type=Schedule.ONCE,
    )
