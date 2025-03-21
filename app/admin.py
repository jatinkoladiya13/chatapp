from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from app.models import User, Message, Status, StatusView
# Register your models here.

@admin.register(User)
class Useradmin(UserAdmin):
    model = User
    list_display = ['id', 'username', 'email', 'profile_image', 'google_profile_image', 'contacts', 'deleted_contacts', 'verfy_otp', 'is_online']
    ordering = ['pk']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    model = Message
    list_display = ['id', 'sender', 'receiver', 'content', 'timestamp', 'is_read_toggle', 'image', 'video', 'video_duration', 'caption', 'replied_to', 'status_view']
    ordering = ['pk']

@admin.register(Status)
class SatusAdmin(admin.ModelAdmin):
    model = Status
    list_display = ['id', 'user', 'image', 'video', 'caption', 'created_at', 'expires_at',]
    ordering = ['pk']

@admin.register(StatusView)
class StatusViewAdmin(admin.ModelAdmin):
    model = StatusView
    list_display = ['id', 'status','viewer','viewed_at',]
    ordering = ['pk']

