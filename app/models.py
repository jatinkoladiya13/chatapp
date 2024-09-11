from django.db import models
from django.contrib.auth.models  import  AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import r
import asyncio 

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
    deleted_by_sender = models.BooleanField(default=False)
    deleted_by_reciver = models.BooleanField(default=False)
   
    def __str__(self) -> str:
        return f'{self.sender.username} to {self.receiver.username}: {self.content[:20]}'   

class Car(models.Model):
    car_name = models.CharField(max_length=500)
    speed = models.IntegerField(default=50)

    def __str__(self) -> str:
        return self.car_name

@receiver(post_save, sender = Car)
async def call_car_api(sender, instance, *args, **kwargs):
    print("Car Object Create")

    print(sender, instance, kwargs)


