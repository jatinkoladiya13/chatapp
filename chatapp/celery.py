from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatapp.settings')

app = Celery('chatapp')
app.conf.update(
    broker_connection_retry_on_startup=True
)

app.config_from_object(settings, namespace='CELERY')

app.autodiscover_tasks()
