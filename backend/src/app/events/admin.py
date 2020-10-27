from django.contrib import admin

from .models import (
    Event,
    EventAttachment,
    EventParticipant,
    EventInviteCalendar,
)


@admin.register(EventInviteCalendar)
class EventInviteCalendarAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'calendar', 'main_calendar', 'response')


class EventInviteCalendarInlineAdmin(admin.TabularInline):
    model = EventInviteCalendar
    extra = 1


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


class EventParticipantInlineAdmin(admin.TabularInline):
    model = EventParticipant
    extra = 1


@admin.register(EventAttachment)
class EventAttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'file')


class EventAttachmentInlineAdmin(admin.TabularInline):
    model = EventAttachment
    extra = 0


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    inlines = (
        EventInviteCalendarInlineAdmin,
        EventParticipantInlineAdmin,
        EventAttachmentInlineAdmin,
    )
    list_display = (
        'id',
        'title',
        'start_at',
        'end_at',
        'description',
        'nature',
        'location',
    )
    filter_vertical = admin.ModelAdmin.filter_vertical + ('subscribers',)
