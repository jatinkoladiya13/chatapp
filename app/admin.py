from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from app.models import User, Message
# Register your models here.

@admin.register(User)
class Useradmin(UserAdmin):
    model = User
    list_display = ['id', 'username', 'email', 'profile_image', 'contacts', 'deleted_contacts', 'verfy_otp']
    ordering = ['pk']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    model = Message
    list_display = ['id', 'sender', 'receiver', 'content', 'timestamp', 'is_read', 'image', 'video', 'caption']
    ordering = ['pk']