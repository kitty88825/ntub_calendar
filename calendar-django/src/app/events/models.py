from django.db import models

from app.calendars.models import Calendar
from app.users.models import User

from django.utils import timezone


class Attachment(models.Model):
    name = models.FileField(upload_to='uploads/%Y%m%d/%H%M%S/')


class Event(models.Model):
    title = models.CharField(max_length=50)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    description = models.TextField(null=True, blank=True)
    create_at = models.DateTimeField(editable=False)
    update_at = models.DateTimeField(editable=False)
    location = models.TextField(null=True, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)
    calendars = models.ManyToManyField(Calendar)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.id:
            self.create_at = timezone.now()
        self.update_at = timezone.now()
        return super(Event, self).save(*args, **kwargs)


class Participant(models.Model):
    role_choice = [
        ('editors', '編輯者'),
        ('participants', '參與者'),
    ]
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    event_id = models.ForeignKey(Event, on_delete=models.CASCADE)
    role = models.CharField(max_length=15, choices=role_choice)

    class Meta:
        unique_together = ['user_id', 'event_id']
