from django.db import models
from django.contrib.auth.models import Group

from app.users.models import User


class Calendar(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)


class Subscription(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    calendar_id = models.ForeignKey(Calendar, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['user_id', 'calendar_id']


class Permission(models.Model):
    role_choice = [
        ('r', '可看'),
        ('w', '可讀'),
    ]
    group_id = models.ForeignKey(Group, on_delete=models.CASCADE)
    calendar_id = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=role_choice)

    class Meta:
        unique_together = ['group_id', 'calendar_id']
