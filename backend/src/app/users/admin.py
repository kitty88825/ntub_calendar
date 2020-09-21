from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, CommonParticipant


@admin.register(User)
class UserAdmin(AuthUserAdmin):
    list_display = ('id', 'username', 'email', 'code', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions',
            ),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        ('role', {'fields': ('role',)}),
        ('url', {'fields': ('code',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
        ('role', {'fields': ('role',)}),
        ('url', {'fields': ('code',)}),
    )
    readonly_fields = ('code',)
    ordering = ('email',)


@admin.register(CommonParticipant)
class CommonParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'creator')
    filter_horizontal = admin.ModelAdmin.filter_vertical + ('participant',)
