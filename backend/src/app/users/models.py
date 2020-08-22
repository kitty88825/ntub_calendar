import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .choices import RoleChoice


class User(AbstractUser):
    email = models.EmailField(unique=True)
    code = models.UUIDField(default=uuid.uuid4, editable=True)
    role = models.CharField(
        max_length=15,
        choices=RoleChoice.choices,
        default=RoleChoice.unknow,
    )

    def __str__(self):
        return self.email


class CommonParticipant(models.Model):
    title = models.CharField('會議名稱', max_length=255)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='common_participant_creators',
    )
    participant = models.ManyToManyField(
        User,
        related_name='common_participant_participants',
    )

    def __str__(self):
        return self.title
