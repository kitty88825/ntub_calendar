from django.contrib import admin

from .models import Calendar, CalendarPermission


@admin.register(Calendar)
class CalendarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'display')


@admin.register(CalendarPermission)
class CalendarPermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'calendar', 'group', 'role', 'authority')
