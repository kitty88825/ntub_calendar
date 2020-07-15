from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(AuthUserAdmin):
    list_display = ('username', 'email', 'code')
    fieldsets = AuthUserAdmin.fieldsets + (
        ('url', {'fields': ('code',)}),
    )
    add_fieldsets = AuthUserAdmin.add_fieldsets + (
        ('url', {'fields': ('code',)}),
    )
    readonly_fields = ('code',)
