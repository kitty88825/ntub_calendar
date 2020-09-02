from django.contrib import admin

from .models import Calendar, CalendarPermission


class CalendarPermissionInlineAdmin(admin.TabularInline):
    model = CalendarPermission


@admin.register(Calendar)
class CalendarAdmin(admin.ModelAdmin):
    inlines = (CalendarPermissionInlineAdmin,)
    list_display = ('id', 'name', 'description', 'display')
    filter_vertical = admin.ModelAdmin.filter_vertical + ('subscribers',)


@admin.register(CalendarPermission)
class CalendarPermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'calendar', 'group', 'role', 'authority')
