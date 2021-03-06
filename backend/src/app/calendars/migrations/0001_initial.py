# Generated by Django 3.1 on 2020-08-22 12:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Calendar',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='行事曆名稱')),
                ('description', models.TextField(blank=True, null=True, verbose_name='詳細資訊')),
                ('display', models.CharField(choices=[('public', '公開'), ('private', '不公開')], default='private', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='CalendarPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('teacher', '老師'), ('student', '學生'), ('unknow', '不知名'), ('system', '系統管理者')], default='system', max_length=15, verbose_name='使用者身份')),
                ('authority', models.CharField(choices=[('read', '可讀'), ('write', '可寫')], default='read', max_length=10, verbose_name='權限')),
                ('calendar', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='calendars.calendar')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
            ],
        ),
        migrations.AddField(
            model_name='calendar',
            name='permission',
            field=models.ManyToManyField(through='calendars.CalendarPermission', to='auth.Group'),
        ),
    ]
