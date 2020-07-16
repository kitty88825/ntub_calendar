from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from rest_framework.authtoken.models import Token

import uuid


class User(AbstractUser):
    email = models.EmailField(unique=True)
    code = models.UUIDField(default=uuid.uuid4, editable=False)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


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
