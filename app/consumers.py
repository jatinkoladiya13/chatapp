import json
from channels.generic.websocket import AsyncWebsocketConsumer
from app.models import Message, User
from channels.db import database_sync_to_async
from django.utils.timezone import localtime
from app.formate_date import format_date
from django.db.models import Q
from asgiref.sync import sync_to_async
from django.utils.dateparse import parse_datetime
from django.core.files.base import ContentFile
import base64
import uuid

@database_sync_to_async
def get_message_receiver_count(sender_id, receiver_id):
    return Message.objects.filter(sender_id=sender_id, receiver_id=receiver_id, is_read=False).count()

@sync_to_async
def get_chat_history(sender_id, receiver_id, deletetion_time_str=None):
        if deletetion_time_str:
            deletion_time = parse_datetime(deletetion_time_str)    
            return list(Message.objects.filter(
            (Q(sender_id=sender_id) & Q(receiver_id=receiver_id) & Q(timestamp__gt=deletion_time)) |
            (Q(sender_id=receiver_id) & Q(receiver_id=sender_id) & Q(timestamp__gt=deletion_time))).order_by('timestamp')) 
        else:
            return list(Message.objects.filter(
                    (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) |
                    (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))).order_by('timestamp')) 

@sync_to_async
def mark_messages_as_read(sender_id, receiver_id):
    return Message.objects.filter(sender_id=receiver_id, receiver_id=sender_id).update(is_read=True)

@sync_to_async
def mark_messages_bothsame_read(sender_id, receiver_id):
    return Message.objects.filter(sender_id=sender_id, receiver_id=receiver_id).update(is_read=True)

class ChatConsumer(AsyncWebsocketConsumer):
     

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name =  f'chat_{self.room_name}'
        id = self.scope['user'].id
        await self.update_user_status(True, id)
        
       
        # join group 
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.broadcast_user_status(id, True)

        await self.accept()

    async def disconnect(self, code):
        id = self.scope['user'].id
        await self.update_user_status(False, id)
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.broadcast_user_status(id, False)

    @database_sync_to_async
    def update_user_status(self, is_online, id):
        user = User.objects.get(id=id)
        user.is_online = is_online
        user.save()  

    async def broadcast_user_status(self, user_id, is_online):
        print("this is working", self.room_group_name)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': user_id,
                'is_online': is_online,
            }
        ) 

    async def user_status(self, event):
        user_id = event['user_id']
        is_online = event['is_online']
        print(f"User status received: User ID {user_id} is {'online' if is_online else 'offline'}")   
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': user_id,
            'is_online': is_online,
        }))    


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender_id = self.scope['user'].id
        receiver_id = text_data_json['receiver_id']
        action = text_data_json['action']

        if action == 'send_history':
            await self.send_chat_history(sender_id, receiver_id)

        if action == 'send_message_toggle_true':
            sender_id = text_data_json['sender_id']
            await mark_messages_bothsame_read(sender_id, receiver_id)

        if action == 'send_message':
            message = text_data_json['message']

            sender = await database_sync_to_async(User.objects.get)(id=sender_id)
            receiver = await database_sync_to_async(User.objects.get)(id=receiver_id)
            

            check = True
            img = ''
            if  sender.id not in [contact["user_id"] for contact in receiver.contacts]:
                receiver.contacts.append({
                    'user_id':sender.id,
                    'delete_status':False,})
                await database_sync_to_async(receiver.save)()
                check = False
                img = sender.profile_image.url if sender.profile_image else None


             
            type_content = ''
            url = ''
            caption = ''

            if not message:
                
                send_data = text_data_json['Send_Data']
               
                data_id = send_data['id']
                file_type = send_data['type']

                if file_type == 'Photo':
                    type_content = 'Photo' 
                    msg_instance = await database_sync_to_async(Message.objects.get)(id=data_id)
                    url     = msg_instance.image.url
                    caption = msg_instance.caption

                elif file_type == 'Video': 
                    type_content = 'Video'
                    msg_instance = await database_sync_to_async(Message.objects.get)(id=data_id)
                    url     = msg_instance.video.url
                    caption = msg_instance.caption
            else:    
                msg_instance = await database_sync_to_async(Message.objects.create)(sender=sender, receiver=receiver, content=message)
            
                      

            if sender_id == int(receiver_id):
                msg_instance.is_read = True
                await database_sync_to_async(msg_instance.save)()


            message_reciver_count = await get_message_receiver_count(sender_id=sender_id,receiver_id=receiver_id,)
            

            local_timestamps = localtime(msg_instance.timestamp)  
            formate_msg_time = format_date(local_timestamps)

            last_msg_time = ''

            if formate_msg_time == 'Today':
                last_msg_time = local_timestamps.strftime('%H:%M')
            else:
                last_msg_time = formate_msg_time
            
            await self.channel_layer.group_send(
                self.room_group_name,
                { 
                'type':'chat_message',
                'message':message,
                'sender':sender.username,
                'timestamp':local_timestamps.strftime('%H:%M'),
                'receiver_id':receiver_id,
                'sender_id':sender_id,
                'is_read':False,
                'toggle_count':message_reciver_count,
                'last_msg_time':last_msg_time,
                'label_time':formate_msg_time,
                'check_contacts':check,
                'img':img,
                'url':url,
                'caption':caption,
                'type_content':type_content
                }
            )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']
        receiver_id = event['receiver_id']
        sender_id = event['sender_id']
        is_read = event['is_read'] 
        toggle_count = event['toggle_count']
        last_msg_time = event['last_msg_time']
        type = event['type']
        label_time = event['label_time']
        check_contacts = event['check_contacts']
        img = event['img']
        url = event['url']
        caption = event['caption']
        type_content = event['type_content'] 


        await self.send(text_data=json.dumps({
            'message':message,
            'sender':sender,
            'timestamp': timestamp,
            'receiver_id':receiver_id,
            'sender_id':sender_id,
            'is_read':is_read,
            'toggle_count':toggle_count,
            'last_msg_time':last_msg_time,
            'type':type,
            'label_time':label_time,
            'check_contacts':check_contacts,
            'img':img,
            'url':url,
            'caption':caption,
            'type_content':type_content,
        }))


    async def send_chat_history(self, sender_id, receiver_id):

        sender  = await sync_to_async(User.objects.get)(id=sender_id)
        reciver = await sync_to_async(User.objects.get)(id=receiver_id)


        deletetion_time_str = sender.deleted_contacts.get(receiver_id)

        messages =  await get_chat_history(sender_id=sender_id,receiver_id=receiver_id, deletetion_time_str=deletetion_time_str)
        
        await mark_messages_as_read(sender_id, receiver_id)
        
        grouped_messages = {}
        for message in messages:
        
            local_timestamp = localtime(message.timestamp)  
            formatted_timestamp = local_timestamp.strftime('%H:%M')            
            date_key = format_date(local_timestamp)
            
            if date_key not in grouped_messages:
                grouped_messages[date_key] = {
                    'date':date_key,
                    'messages':[]
                }

            video_url = str(message.video.url) if message.video and message.video.name else None
            grouped_messages[date_key]['messages'].append({
                'content':message.content,
                'sender':message.sender_id,
                'receiver': message.receiver_id,
                'timestamp':formatted_timestamp,
                'img':str(message.image),
                'video':video_url,
                'caption':message.caption,
            })
        
        response_data = list(grouped_messages.values())

        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'history': response_data,
            'sender_id':sender_id,
            'status':reciver.is_online,
        }))

