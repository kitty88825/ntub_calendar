# Generated by Django 3.0.8 on 2020-07-31 09:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
        ('calendars', '0007_auto_20200731_1716'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='permission',
            unique_together={('group', 'calendar', 'role')},
        ),
    ]
