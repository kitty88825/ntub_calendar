from django.contrib import admin

from .models import Event, EventAttachment, EventParticipant


@admin.register(EventAttachment)
class EventAttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'file')


class EventAttachmentInlineAdmin(admin.TabularInline):
    model = EventAttachment
    extra = 0


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    inlines = (EventAttachmentInlineAdmin,)
    list_display = (
        'id',
        'title',
        'start_at',
        'end_at',
        'description',
        'nature',
        'location',
    )
    filter_vertical = admin.ModelAdmin.filter_vertical + \
        ('calendars', 'subscribers')


@admin.register(EventParticipant)
class EventParticipantAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user_id',
        'user',
        'event_id',
        'event',
        'role',
        'response',
    )
