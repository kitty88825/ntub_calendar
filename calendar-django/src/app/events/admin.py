from django.contrib import admin

from .models import Attachment, Event, Participant


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    pass


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'create_at', 'update_at')


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    pass
