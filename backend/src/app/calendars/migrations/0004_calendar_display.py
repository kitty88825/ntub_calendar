# Generated by Django 3.0.7 on 2020-07-29 02:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0003_auto_20200524_2229'),
    ]

    operations = [
        migrations.AddField(
            model_name='calendar',
            name='display',
            field=models.CharField(choices=[('public', '公開'), ('private', '不公開')], default='private', max_length=10),
        ),
    ]
