from django.db import models

from app.calendars.models import Calendar
from app.users.models import User

from .choices import (
    NatureChoice,
    RoleChoice,
    EventParticipantResponseChoice,
    CalendarInvitationResponseChoice,
)


def event_attachment_path(instance, filename):
    return f'event_attachment/{instance.event.id}/{filename}'


class Event(models.Model):
    title = models.CharField('行程名稱', max_length=50)
    start_at = models.DateTimeField('開始時間')
    end_at = models.DateTimeField('結束時間')
    description = models.TextField('備註', blank=True, null=True)
    create_at = models.DateTimeField('建立時間', auto_now_add=True)
    update_at = models.DateTimeField('更新時間', auto_now=True)
    location = models.TextField('地點', blank=True, null=True)
    nature = models.CharField(
        max_length=15,
        choices=NatureChoice.choices,
        default=NatureChoice.event,
    )
    calendars = models.ManyToManyField(
        Calendar,
        through="EventInviteCalendar",
        through_fields=['event', 'calendar'],
    )
    subscribers = models.ManyToManyField(
        User,
        blank=True,
        related_name='subscribe_events',
    )
    participants = models.ManyToManyField(
        User,
        through='EventParticipant',
        related_name='participate_events',
    )

    def __str__(self):
        return self.title

    @property
    def link(self):
        return self.id


class EventAttachment(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField('檔案位置', upload_to=event_attachment_path)

    def __str__(self):
        return str(self.file)


class EventParticipant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
    )
    role = models.CharField(
        '身份',
        max_length=15,
        choices=RoleChoice.choices,
        default=RoleChoice.participants,
    )
    response = models.CharField(
        '回應',
        max_length=15,
        choices=EventParticipantResponseChoice.choices,
        default=EventParticipantResponseChoice.no_reply,
    )

    class Meta:
        unique_together = ['user', 'event']

    def __str__(self):
        return self.role


class EventInviteCalendar(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    main_calendar = models.ForeignKey(
        Calendar,
        on_delete=models.CASCADE,
        related_name='main_calendar',
    )
    response = models.CharField(
        '回應',
        max_length=15,
        choices=CalendarInvitationResponseChoice.choices,
        default=CalendarInvitationResponseChoice.no_reply,
    )

    class Meta:
        unique_together = ['calendar', 'event']

    def __str__(self):
        return self.response
