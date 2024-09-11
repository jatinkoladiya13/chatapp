from django.utils.timezone import localtime
from datetime import  datetime, timedelta

def format_date(date):
    now = datetime.now()
    today = now.date()
    yesterday = today - timedelta(days=1)

    if date.date() == today:
        return 'Today'
    elif date.date() == yesterday:
        return 'Yesterday'
    elif date.date() >= today - timedelta(days=7):
        return date.strftime('%b %d, %Y')
    else:
        return date.strftime('%b %d, %Y') 