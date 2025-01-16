# Generated by Django 5.0.7 on 2024-10-02 10:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0015_user_last_seen'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='last_seen',
        ),
        migrations.AddField(
            model_name='user',
            name='is_online',
            field=models.BooleanField(default=False),
        ),
    ]
