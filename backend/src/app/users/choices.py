from django.db import models
from django.utils.translation import gettext_lazy as _


class RoleChoice(models.TextChoices):
    teacher = 'teacher', _('老師')
    student = 'student', _('學生')
    unknow = 'unknow', _('不知名')
    system = 'system', _('系統管理者')
