from django.db import models
from django.contrib.auth.models  import  AbstractUser
from django.utils import timezone
from datetime import timedelta

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True,  blank=True)
    verfy_otp = models.IntegerField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='product_images/',  blank=True, null=True) 
    google_profile_image = models.URLField(blank=True, null=True)
    contacts = models.JSONField(default=list, blank=True) 
    deleted_contacts = models.JSONField(default=dict, blank=True)
    is_online = models.BooleanField(default=False)

    first_name = None
    last_name = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ('username',)

    def get_profile_image(self):

        if self.profile_image:
            return self.profile_image.url if self.profile_image else None
        elif self.google_profile_image:
            return self.google_profile_image
        
        return "/static/default_profile.png"


    def __str__(self) -> str:
        return f'{self.username}'



class Status(models.Model):
    user = models.ForeignKey(User, related_name='statuses', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='status_images/', blank=True, null=True)
    video = models.FileField(upload_to='status_videos/', blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()


    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() +  timedelta(hours=24)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        if self.image:
            return f'{self.user.username} posted an image status'
        elif self.video:
            return f'{self.user.username} posted a video status'
        else:
            return f'{self.user.username} posted a media status'

    def is_expired(self):
        return timezone.now() > self.expires_at
    

class StatusView(models.Model):
    status = models.ForeignKey(Status, related_name='views', on_delete=models.CASCADE)
    viewer = models.ForeignKey(User, related_name='viewed_statuses', on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.viewer.username} viewed {self.status.user.username}\'s status'
            
                
class Message(models.Model):
    STATUS_CHOICES = {
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('seen', 'Seen'),
    }

    sender   = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User,related_name='received_messages', on_delete=models.CASCADE) 
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read_toggle = models.BooleanField(default=False, blank=True, null=True)
    status_view = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')

    image = models.ImageField(upload_to='message_images/', blank=True, null=True)
    video = models.FileField(upload_to='message_videos/', blank=True, null=True)
    video_duration = models.IntegerField(blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True, null=True) 
    replied_to = models.ForeignKey(Status, related_name='status_replies', on_delete=models.CASCADE, blank=True,null=True)
   
    def __str__(self) -> str:
        if self.content:
            return f'{self.sender.username} to {self.receiver.username}: {self.content[:20]}'   
        elif self.image:
            return f'{self.sender.username} sent an image to {self.receiver.username}'
        elif self.video:
            return f'{self.sender.username} sent a video to {self.receiver.username}'
        else:
            return f'{self.sender.username} to {self.receiver.username}: [Media]'

