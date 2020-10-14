from django.db import models
from django.contrib.auth.models import Group

from colorfield import fields

from app.users.models import User

from .choices import DisplayChoice, RoleChoice, AuthorityChoice


class Calendar(models.Model):
    name = models.CharField('行事曆名稱', max_length=50, unique=True)
    description = models.TextField('詳細資訊', blank=True, null=True)
    display = models.CharField(
        max_length=10,
        choices=DisplayChoice.choices,
        default=DisplayChoice.private,
    )
    subscribers = models.ManyToManyField(User, blank=True)
    groups = models.ManyToManyField(Group, through='CalendarPermission')
    color = fields.ColorField(default='#FF0000')

    def __str__(self):
        return self.name


class CalendarPermission(models.Model):
    calendar = models.ForeignKey(
        Calendar,
        on_delete=models.CASCADE,
        related_name='permissions',
    )
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    role = models.CharField(
        '使用者身份',
        max_length=15,
        choices=RoleChoice.choices,
        default=RoleChoice.system,
    )
    authority = models.CharField(
        '權限',
        max_length=10,
        choices=AuthorityChoice.choices,
        default=AuthorityChoice.read,
    )

    class Meta:
        unique_together = ['group', 'calendar', 'role']

    def __str__(self):
        return f'{self.id},{self.calendar.name}/{self.group.name}/{self.role}'
