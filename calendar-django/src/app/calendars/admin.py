from django.contrib import admin

from .models import Calendar, Subscription, Permission


@admin.register(Calendar)
class CalendarAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'calendar_id')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('group_id', 'calendar_id', 'role')
