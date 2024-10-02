from django.db import models
from django.contrib.auth.models  import  AbstractUser

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True,  blank=True)
    verfy_otp = models.IntegerField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='product_images/',  blank=True, null=True) 
    contacts = models.JSONField(default=list, blank=True) 
    deleted_contacts = models.JSONField(default=dict, blank=True)

    first_name = None
    last_name = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ('username',)

    def __str__(self) -> str:
        return f'{self.username}'
    
class Message(models.Model):
    sender   = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User,related_name='received_messages', on_delete=models.CASCADE) 
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False, blank=True, null=True)
   

    image = models.ImageField(upload_to='message_images/', blank=True, null=True)
    video = models.FileField(upload_to='message_videos/', blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True, null=True) 
   
    def __str__(self) -> str:
        if self.content:
            return f'{self.sender.username} to {self.receiver.username}: {self.content[:20]}'   
        elif self.image:
            return f'{self.sender.username} sent an image to {self.receiver.username}'
        elif self.video:
            return f'{self.sender.username} sent a video to {self.receiver.username}'
        else:
            return f'{self.sender.username} to {self.receiver.username}: [Media]'





