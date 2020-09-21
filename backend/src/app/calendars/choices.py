from django.db import models
from django.utils.translation import gettext_lazy as _


class DisplayChoice(models.TextChoices):
    public = 'public', _('公開')
    private = 'private', _('不公開')


class RoleChoice(models.TextChoices):
    teacher = 'teacher', _('老師')
    student = 'student', _('學生')
    unknow = 'unknow', _('不知名')
    system = 'system', _('系統管理者')


class AuthorityChoice(models.TextChoices):
    read = 'read', _('可讀'),
    write = 'write', _('可寫'),
