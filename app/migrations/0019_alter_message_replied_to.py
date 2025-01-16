# Generated by Django 5.0.7 on 2025-01-10 09:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0018_message_replied_to'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='replied_to',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='status_replies', to='app.status'),
        ),
    ]
