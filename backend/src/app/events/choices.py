from django.utils.translation import gettext_lazy as _
from django.db import models


class NatureChoice(models.TextChoices):
    meeting = 'meeting', _('會議')
    event = 'event', _('行程')


class RoleChoice(models.TextChoices):
    editors = 'editors', _('編輯者')
    participants = 'participants', _('參與者')