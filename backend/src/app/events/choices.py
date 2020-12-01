from django.utils.translation import gettext_lazy as _
from django.db import models


class NatureChoice(models.TextChoices):
    meeting = 'meeting', _('會議')
    event = 'event', _('行程')


class RoleChoice(models.TextChoices):
    editors = 'editors', _('編輯者')
    participants = 'participants', _('參與者')


class EventParticipantResponseChoice(models.TextChoices):
    accept = 'accept', _('接受')
    decline = 'decline', _('拒絕')
    maybe = 'maybe', _('不確定')
    no_reply = 'no_reply', _('未回應')


class CalendarInvitationResponseChoice(models.TextChoices):
    accept = 'accept', _('接受')
    decline = 'decline', _('拒絕')
    no_reply = 'no_reply', _('未回應')
