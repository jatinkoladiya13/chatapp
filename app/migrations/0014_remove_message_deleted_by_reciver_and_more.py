# Generated by Django 5.0.7 on 2024-09-13 10:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0013_message_caption_message_image_message_video'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='deleted_by_reciver',
        ),
        migrations.RemoveField(
            model_name='message',
            name='deleted_by_sender',
        ),
    ]