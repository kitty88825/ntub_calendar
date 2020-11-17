from django.db import models


class TelegramBot(models.Model):
    chat_id = models.CharField(max_length=255)
    user_id = models.IntegerField()
