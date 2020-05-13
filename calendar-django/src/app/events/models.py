from django.db import models

from app.calendars.models import Calendar
from app.users.models import User


class Event(models.Model):
    title = models.CharField(max_length=50)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    description = models.TextField(null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    location = models.TextField(null=True, blank=True)
    calendars = models.ManyToManyField(Calendar)

    def __str__(self):
        return self.title


class Attachment(models.Model):
    def attachment_path(instance, filename):
        # file will be uploaded to MEDIA_ROOT/<event.id>/<filename>
        return f'event_attachment/{instance.event.id}/{filename}'

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attachments')  # noqa: E501
    name = models.FileField(upload_to=attachment_path)


class Participant(models.Model):
    role_choice = [
        ('editors', '編輯者'),
        ('participants', '參與者'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    role = models.CharField(max_length=15, choices=role_choice)

    class Meta:
        unique_together = ['user', 'event']
