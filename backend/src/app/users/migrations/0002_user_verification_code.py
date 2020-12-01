# Generated by Django 3.1.3 on 2020-11-30 03:24

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='verification_code',
            field=models.UUIDField(default=uuid.uuid4),
        ),
    ]