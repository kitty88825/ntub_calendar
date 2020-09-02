from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin

from .models import User, CommonParticipant


@admin.register(User)
class UserAdmin(AuthUserAdmin):
    list_display = ('id', 'username', 'email', 'code', 'role')
    fieldsets = AuthUserAdmin.fieldsets + (
        ('role', {'fields': ('role',)}),
        ('url', {'fields': ('code',)}),
    )
    add_fieldsets = AuthUserAdmin.add_fieldsets + (
        ('role', {'fields': ('role',)}),
        ('url', {'fields': ('code',)}),
    )
    readonly_fields = ('code',)


@admin.register(CommonParticipant)
class CommonParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'creator')
    filter_horizontal = admin.ModelAdmin.filter_vertical + ('participant',)
