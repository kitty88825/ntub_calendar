from django.contrib import admin

from .models import Calendar, Subscription, Permission


@admin.register(Calendar)
class CalendarAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'display')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'calendar')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('group', 'calendar', 'role')
