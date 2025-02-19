import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from app.models import Message, User, Status
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



@database_sync_to_async
def get_reciver_name(message):
    return message.receiver.username

user_connections = {}
class ChatConsumer(AsyncWebsocketConsumer):
     

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name =  f'chat_{self.room_name}'
        id = self.scope['user'].id
        
        await self.update_user_status(True, id)

        if id not in user_connections:
            user_connections[id] = []
        user_connections[id].append(self)

        
        
       
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

        if id in user_connections:
            user_connections[id].remove(self)
            if not user_connections[id]:
                del user_connections[id]  

       
        
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
        action = text_data_json['action']

        if action == 'uploade_status':
            uploaded_user_id = text_data_json['uploaded_user_id']
            status_id = text_data_json['status_id']
            uploaded_users_contacts = text_data_json['uploaded_users_contacts']

            
            
            uploaded_contacts_id = [contact['user_id'] for contact in uploaded_users_contacts]
            
            for id in uploaded_contacts_id:
                if id in user_connections:
                    for coneection in user_connections[id]:
                        await coneection.send(text_data=json.dumps({
                            'type': 'uploade_status',
                            'uploaded_user_id': uploaded_user_id,
                            'status_id':status_id,
                            'uploaded_users_contacts':uploaded_users_contacts,
                            })
                        )
               


        if action == 'send_history':
            receiver_id = text_data_json['receiver_id']
            await self.send_chat_history(sender_id, receiver_id)

        if action == 'send_message_toggle_true':
            receiver_id = text_data_json['receiver_id']
            sender_id = text_data_json['sender_id']
            await mark_messages_bothsame_read(sender_id, receiver_id)

        if action == 'send_message':
            message = text_data_json['message']
            receiver_id = text_data_json['receiver_id']
            status_id = text_data_json.get('status_id', '')

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
            is_reply_status = False
            video_duration = ''

            if not message:
                
                send_data = text_data_json.get('Send_Data', '')
                if send_data != '': 
                    
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
                    if sender_id != '':
                        status_reply_caption = text_data_json['status_reply_caption']
                        video_duration = int(text_data_json['video_duration'])

                        get_status =  await database_sync_to_async(Status.objects.get)(id=status_id)
                        msg_instance = await database_sync_to_async(Message.objects.create)(sender=sender, receiver=receiver, caption=status_reply_caption, video_duration=video_duration, image=get_status.image, replied_to=get_status)
                        
                        is_reply_status = True
                        caption = msg_instance.caption

                        if video_duration == 0: 
                            type_content = 'Photo'
                        else:    
                            type_content = 'Video'

                        url = get_status.image.url if get_status.image else None    
                      

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
                'type_content':type_content,
                'is_reply_status':is_reply_status ,
                'reciver_name':receiver.username,
                'video_duration':video_duration,
                }
            )
            video_duration = ''
            is_reply_status = False

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
        is_reply_status = event['is_reply_status']
        reciver_name = event['reciver_name']
        video_duration = event['video_duration']

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
            'is_reply_status':is_reply_status,
            'reciver_name':reciver_name,
            'video_duration':video_duration,
        }))


    async def send_chat_history(self, sender_id, receiver_id):

        sender  = await sync_to_async(User.objects.get)(id=sender_id)
        reciver = await sync_to_async(User.objects.get)(id=receiver_id)


        deletetion_time_str = sender.deleted_contacts.get(receiver_id)

        messages =  await get_chat_history(sender_id=sender_id,receiver_id=receiver_id, deletetion_time_str=deletetion_time_str)
        
        await mark_messages_as_read(sender_id, receiver_id)
        is_reply_status = False
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

            

            replied_video_duration = message.video_duration
            if replied_video_duration is not None:
                is_reply_status = True
                img_url = message.image.url if message.image and message.image.name else None
                if replied_video_duration == 0:
                    image = str(img_url) 
                else:
                    video_url = str(img_url)    
            else:
                video_url = str(message.video.url) if message.video and message.video.name else None
                image =str(message.image)

            
              
           
           
            reciver_username = await get_reciver_name(message)

        
            grouped_messages[date_key]['messages'].append({
                'content':message.content,
                'sender':message.sender_id,
                'receiver': message.receiver_id,
                'timestamp':formatted_timestamp,
                'img':image,
                'video':video_url,
                'caption':message.caption,
                'is_reply_status':is_reply_status,
                'reciver_name':reciver_username,
                'replied_video_duration':replied_video_duration,
            })
             
            image  = ''
            video_url = '' 
            is_reply_status = False
            

        response_data = list(grouped_messages.values())

        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'history': response_data,
            'sender_id':sender_id,
            'status':reciver.is_online,
        }))

    async def status_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
                'type': 'status_update',
                'message': message,
            })
        )

  
