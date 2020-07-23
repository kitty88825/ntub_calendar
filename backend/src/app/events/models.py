from django.utils.translation import gettext_lazy as _
from django.db import models

from app.calendars.models import Calendar
from app.users.models import User


class Event(models.Model):
    class NatureChoice(models.TextChoices):
        meeting = 'meeting', _('會議')
        event = 'event', _('行程')

    title = models.CharField('行程名稱', max_length=50)
    start_at = models.DateTimeField('開始時間')
    end_at = models.DateTimeField('結束時間')
    description = models.TextField('備註', null=True, blank=True)
    create_at = models.DateTimeField('建立時間', auto_now_add=True)
    update_at = models.DateTimeField('更新時間', auto_now=True)
    location = models.TextField('地點', null=True, blank=True)
    calendars = models.ManyToManyField(Calendar)
    nature = models.CharField(max_length=15, choices=NatureChoice.choices)

    def __str__(self):
        return self.title

    def link(self):
        return f'/event/{self.id}'


class Attachment(models.Model):
    def attachment_path(instance, filename):
        # file will be uploaded to MEDIA_ROOT/<event.id>/<filename>
        return f'event_attachment/{instance.event.id}/{filename}'

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attachments')  # noqa: E501
    file = models.FileField('檔案位置', upload_to=attachment_path)


class Participant(models.Model):
    class RoleChoice(models.TextChoices):
        editors = 'editors', _('編輯者')
        participants = 'participants', _('參與者')

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    role = models.CharField(max_length=15, choices=RoleChoice.choices)

    class Meta:
        unique_together = ['user', 'event']
