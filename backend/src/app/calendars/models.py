from django.db import models
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _

from app.users.models import User


class Calendar(models.Model):
    display_choice = [
        ('public', '公開'),
        ('private', '不公開'),
    ]
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True, default="")
    display = models.CharField(
        max_length=10,
        choices=display_choice,
        blank=False,
        null=False,
    )

    def __str__(self):
        return self.name


class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['user', 'calendar']


class Permission(models.Model):
    class RoleChoice(models.TextChoices):
        teacher = 'teacher', _('老師')
        student = 'student', _('學生')
        unknow = 'unknow', _('不知名')
        system = 'system', _('系統管理者')

    authority_choice = [
        ('r', '可讀'),
        ('w', '可寫'),
    ]
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=15, choices=RoleChoice.choices, default='system')
    authority = models.CharField(
        max_length=10, choices=authority_choice, default='r')

    class Meta:
        unique_together = ['group', 'calendar', 'role']
