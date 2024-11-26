from django import template
from datetime import  datetime, timedelta

def relative_time(value):
    if not value:
        return ""
    
    now = datetime.now()
    today = now.date()
    yesterday = today - timedelta(days=1)

    time_str = value.strftime("%H:%M")

    # Check if it's today
    if value.date() == today:
        return f"Today at {time_str}"

    # Check if it was yesterday
    elif value.date() == yesterday:
        return f"Yesterday at {time_str}"

    # Otherwise, return the date with time
    return value.strftime("%d %b %Y at %H:%M")