from django.contrib.auth.models import AbstractUser
from django.db import models

from django.utils.translation import gettext_lazy as _

import uuid


class User(AbstractUser):
    class RoleChoice(models.TextChoices):
        teacher = 'teacher', _('老師')
        student = 'student', _('學生')
        unknow = 'unknow', _('不知名')
        system = 'system', _('系統管理者')

    email = models.EmailField(unique=True)
    code = models.UUIDField(default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=15, choices=RoleChoice.choices, default='unknow')


class CommonMeeting(models.Model):
    title = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class CommonParticipant(models.Model):
    common_meeting = models.ForeignKey(CommonMeeting, on_delete=models.CASCADE)
    participant = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['common_meeting', 'participant']
