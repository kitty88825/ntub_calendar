from django.contrib.auth.models import AbstractUser
from django.db import models

import uuid


class User(AbstractUser):
    email = models.EmailField(unique=True)
    code = models.UUIDField(default=uuid.uuid4, editable=False)


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
