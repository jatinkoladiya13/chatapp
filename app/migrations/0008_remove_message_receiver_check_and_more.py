# Generated by Django 5.0.7 on 2024-08-30 11:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_message_receiver_check_message_sender_check'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='receiver_check',
        ),
        migrations.RemoveField(
            model_name='message',
            name='sender_check',
        ),
    ]
