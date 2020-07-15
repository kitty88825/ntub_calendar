from django.db import models
from django.contrib.auth.models import Group

from app.users.models import User


class Calendar(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['user', 'calendar']


class Permission(models.Model):
    role_choice = [
        ('r', '可讀'),
        ('w', '可寫'),
    ]
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=role_choice)

    class Meta:
        unique_together = ['group', 'calendar']
