# Generated by Django 5.0.7 on 2024-09-02 08:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0009_message_deleted_by_reciver_message_deleted_by_sender'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='deleted_contacts',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
