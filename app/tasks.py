from celery import shared_task
from django.utils.timezone import now
from .models import Status
from channels.layers import get_channel_layer
from datetime import datetime
from django.utils import timezone
from asgiref.sync import async_to_sync

@shared_task
def delete_expired_statues():
    
    expired_statuses = Status.objects.filter(expires_at__lte=now())
    count = expired_statuses.count()
    
    if count > 0:
        channel_layer = get_channel_layer()
        for status in expired_statuses:
            status_data = {
                'uploaded_user_id': status.user.id,
                'status_id': str(status.id),  
                'uploaded_users_contacts':status.user.contacts, 
                'message': 'Status expired and deleted',
            }

    
            async_to_sync(channel_layer.group_send)(
                'chat_chat_consumer',  
                {
                    'type': 'status_update', 
                    'message': status_data
                }
            )

    
        expired_statuses.delete()
    return f"{count} expired statuses deleted."
