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
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='creator_users')
    participant = models.ManyToManyField(
        User, related_name='participant_users')

    def __str__(self):
        return self.title
