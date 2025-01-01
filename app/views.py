from django.shortcuts import render, redirect
from app.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from app.email import send_otp_via_email
from .untils import encrypt, decrypt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from app.models import User, Message, Status, StatusView
from django.db.models import Q
from django.utils.timezone import localtime
from app.formate_date import format_date
from django.db.models import Q
from app.decorator import custom_login_required
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from app.custom_time_filters import relative_time
from django.utils import timezone
import json
import uuid
# Create your views here.

def register(request):
    if request.method == 'POST':
        name = request.POST['name']
        email = request.POST['email']
        password = request.POST['password']
        profile_img = request.FILES.get('profile_image')


        if len(name)>20:
            messages.error(request, "Username must be under 20 charcters!!")
            return redirect('register')
       
        if User.objects.filter(username = name, email=email).exists():
            messages.error(request, "This username is already taken. Please choose another one.")
            return redirect('register')

        user = User.objects.create(username = name, email=email)

        if profile_img is not None:
            user.profile_image = profile_img

        user.set_password(password)
        user.save()
        messages.success(request, "Your account has been registered successfully!")
        return redirect('login')


    return render(request, 'register.html')

def loginpage(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        
        print(f"email=={email}==password==={password}")
        if User.objects.filter(email=email).exists():
            user = authenticate(request,  email=email, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, "Your login successfully!")
                return redirect('home') 
            else:
                messages.error(request, "Bad carditional")
        else:
            messages.success(request,"Email not existed..!") 
    return render(request, 'login.html')

def logouts(request):
    logout(request)
    messages.success(request,"Log out successfully..!")
    return redirect('login')


def sendOTP(request):
    if request.method == 'POST':
        email = request.POST['email']
        if User.objects.filter(email=email).exists():
            send_otp_via_email(email)
            messages.success(request, "Your changepasswrod OTP send your email successfully!")
            return redirect(f'/verifyotp/?to={encrypt(str(email))}')
        else:
            messages.error(request, "This email is not exists..!")
            return redirect('sendlink')   
    return render(request, 'sendlink.html')


def verifyotp(request):
    to = request.GET.get('to')
    email = ''
    if to is not None:
        email = decrypt(to) 
    if request.method == 'POST':
        
        user = User.objects.get(email=email)
        otp1 = request.POST.get('otp1')
        otp2 = request.POST.get('otp2')
        otp3 = request.POST.get('otp3')
        otp4 = request.POST.get('otp4') 
        otp = f'{otp1}{otp2}{otp3}{otp4}'
        print(f"email={user is not None}=={email}==ortp====={type(otp)}==verfy+otp====={otp == user.verfy_otp}======={type(user.verfy_otp)}=======") 
        if user is not None and otp == str(user.verfy_otp):
            messages.success(request, "Your  OTP verifyed successfully!")
            return redirect(f'/changepassword/?to={encrypt(str(email))}')
        else:
            messages.error(request, "This email is not exists..!")
            return redirect(f'/verifyotp/?to={to}') 

    return render(request, "verifyotp.html", {"email": email})


def changepassword(request):
    to = request.GET.get('to')
    email = ''
    if to is not None:
        email = decrypt(to)   
    if request.method == 'POST':
        password = request.POST['password']
        user = User.objects.get(email=email)
        if user:
            user.set_password(password)
            user.verfy_otp = 0
            user.save()
            messages.success(request, "Your  password change successfully!")
            return redirect('login')
        else:
            messages.error(request, "This email is not exists..!")
            return redirect(f'/changepassword/?to={to}') 
    return render(request, 'resetpassword.html')

@csrf_exempt
def resendotp(request):
        if request.method == 'POST':
            json_id=json.loads(request.body)
            email = json_id.get('email') 
            if email is not None:
                send_otp_via_email(email)
                return JsonResponse({'message':  "Your changepasswrod OTP send your email successfully!"}, status=200) 
            else :
                return  JsonResponse({'error': "This email is not exists..!"}, status=200) 
        return JsonResponse({'error': 'Invalid request'}, status=400) 
    
@custom_login_required
def home(request):
    login_user  = request.user
    

    contact_ids = [contact['user_id'] for contact in login_user.contacts if contact['delete_status'] != True]
    
    
    
    contact_users = User.objects.filter(id__in=contact_ids) 
    user_data = []
    for contact_user in contact_users:
        message_reciver_count = Message.objects.filter(sender_id=contact_user.id,receiver_id=login_user.id, is_read=False).count()
        
        if contact_user.id == login_user.id:
            message_reciver_count = 0
        
        deletetion_time_str = login_user.deleted_contacts
        check =     login_user.deleted_contacts.get(contact_user.id)
        if check:
            deletetion_time_str = login_user.deleted_contacts[contact_user.id]

        if deletetion_time_str and check is not None:
            deletion_time = parse_datetime(deletetion_time_str)    
            last_message = Message.objects.filter(
                Q(sender_id = login_user.id, receiver_id=contact_user.id) & Q(timestamp__gt=deletion_time) | Q(sender_id=contact_user.id, receiver_id=login_user.id) & Q(timestamp__gt=deletion_time)
            ).order_by('-timestamp').first()
        else:     
            last_message = Message.objects.filter(
                Q(sender_id = login_user.id, receiver_id=contact_user.id) | Q(sender_id=contact_user.id, receiver_id=login_user.id)
            ).order_by('-timestamp').first()
        
        last_msg_time = ''
        last_msg = ''
        if last_message:
            local_timestamp = localtime(last_message.timestamp)
            last_msg_time = format_date(local_timestamp)
            if last_msg_time == 'Today':
                last_msg_time = local_timestamp.strftime('%H:%M')
            if last_message.image:    
                last_msg = 'Photo'
            elif last_message.video:
                last_msg = 'Video'
            else:
                last_msg = last_message.content            
       

        user_data.append({
            'id': contact_user.id,
            'username': contact_user.username,
            'email': contact_user.email,
            'profile_image':contact_user.profile_image.url if contact_user.profile_image else None,
            'toggle_count':message_reciver_count,
            'last_msg_time':last_msg_time,
            'last_msg': last_msg,
        })
    return render(request, 'index.html', {'user_data':user_data})

@csrf_exempt
def create_contacts(request):
    if request.method == 'POST':
        login_user_id = request.user.id
        json_id=json.loads(request.body)
        contact_email = json_id.get('contact_email')
        user  = User.objects.get(email=contact_email)
        if user :
            create_by_user = User.objects.get(id=login_user_id)

            if not isinstance(create_by_user.contacts, list):
                create_by_user.contacts = []

            for contact in create_by_user.contacts:
                if contact['user_id'] == user.id:
                    contact['delete_status'] = False
                    break
                if contact['user_id'] in create_by_user.deleted_contacts:
                    del create_by_user.deleted_contacts[contact['user_id']]
            else:
                print(type(user.contacts), user.contacts)
                create_by_user.contacts.append({
                    'user_id':user.id,
                    'delete_status':False,})
            create_by_user.save()
            return JsonResponse({'status':'200', 'message':  "Create contact successfully..!"}, status=200)    
                 
        else :
            return  JsonResponse({'error': "This email is not exists..!"}, status=400) 
    return JsonResponse({'error': 'Invalid request'}, status=400)    


def get_contacts(request):
    user_id = request.user.id
    user = User.objects.get(id=user_id)

    search_term = request.GET.get('q', '').strip()

    contact_ids = [contact['user_id'] for contact in user.contacts if contact['delete_status'] != True]

    if search_term:
        contact_users = User.objects.filter(
            id__in=contact_ids,
            username__icontains=search_term
        )
    else:
        contact_users = User.objects.filter(id__in=contact_ids)    

    
    contact_user_data = [
        {
            'id': contact_user.id,
            'username': contact_user.username,
            'profile_image': contact_user.profile_image.url if contact_user.profile_image else None,
        }
        for contact_user in contact_users
    ]
   
    return JsonResponse({'status':'200', 'data':  contact_user_data}, status=200)

def  delete_contact(request, contact_id):
    if request.method == 'GET':
        user_id = request.user.id
        user = get_object_or_404(User, id=user_id)
          
       
        contact_users  = get_object_or_404(User, id=contact_id)

        if contact_id:
            contact_id = int(contact_id)

            if  isinstance(user.contacts, list):

                contact_users_dict = {contact['user_id']: contact for contact in contact_users.contacts}
                
                
                updated_contact_user_contacts = []
                updated_user_contacts = []
                contact_user_contact_found = False
                   
                contact_user = contact_users_dict.get(user_id)
                if contact_user and contact_user['delete_status']:
                    contact_user_contact_found = True
                    messages_to_delete = Message.objects.filter(
                                (Q(sender_id=user_id) & Q(receiver_id=contact_id)) |
                                (Q(sender_id=contact_id) & Q(receiver_id=user_id))
                            )
                    num_deleted, _ =  messages_to_delete.delete()
                    contact_users.deleted_contacts.pop(str(contact_user['user_id']), None)


                for  contact_user in contact_users.contacts:
                    if contact_user['user_id'] != user_id or not contact_user['delete_status']:
                        updated_contact_user_contacts.append(contact_user)

                if contact_user_contact_found:
                    contact_users.contacts = updated_contact_user_contacts
                    contact_users.save()

               
                for contact in user.contacts:
                    if contact['user_id'] == contact_id:
                        contact['delete_status'] = True
                        if not contact_user_contact_found:
                            user.deleted_contacts[contact['user_id']] = timezone.now().isoformat()
                            updated_user_contacts.append(contact)
                        else:
                            user.deleted_contacts.pop(str(contact_id), None)                                        
                    else:
                        updated_user_contacts.append(contact)


                user.contacts = updated_user_contacts
                user.save()
                return JsonResponse({'status':'200', 'message':  "Contact removed successfully..!"}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def upload_videos(request):
    if request.method == 'POST':
        video = request.FILES.get('video')
        image = request.FILES.get('image')
        receiver_usr = request.POST.get('receiver_usr')
        caption = request.POST.get('captions')
        sender_id = request.user.id

        receiver_msg = User.objects.get(id=receiver_usr)
        sender_msg = User.objects.get(id=sender_id)
    
        send_data = {}
        if image:
            new_filename = f"{uuid.uuid4()}.jpg"
            image.name = new_filename
            msg_instance = Message.objects.create(
                        sender=sender_msg, receiver=receiver_msg, image=image, caption=caption, content='',)
            send_data = {'id':msg_instance.id, 'type': 'Photo',}

        elif video:   
            new_filename = f"{uuid.uuid4()}.mp4" 
            video.name = new_filename
            msg_instance = Message.objects.create(
                        sender=sender_msg, receiver=receiver_msg, video=video, caption=caption, content='',)
            send_data = {'id':msg_instance.id, 'type': 'Video',}
         
        return JsonResponse({'status':'200', 'message': send_data}, status=200)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def edit_profile(request):

    if request.method == 'POST':
        id  = request.user.id
    
        image = request.FILES.get('profile_image')
        name = request.POST.get('name-input')
        email = request.POST.get('email-input')
        
        user = User.objects.get(id=id)
        
        if image:
            user.profile_image = image
        elif name:
            user.username = name
        elif email:
            user.email = email

        user.save()
        
        return JsonResponse({'status':'200', 'message': 'this is ok'}, status=200)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def upload_status(request):
    if request.method == 'POST':
        image = request.FILES.get('image')
        video = request.FILES.get('video')
        background_img = request.FILES.get('background_img')
        caption = request.POST.get('caption')
        user_id = request.user.id

        user = User.objects.get(id=user_id)
        send_data = {}
        type = ''
        if image:
            new_filename = f"{uuid.uuid4()}.jpg"
            image.name = new_filename
            type = 'Photo'

        elif video:   
            new_filename = f"{uuid.uuid4()}.mp4" 
            video.name = new_filename
            background_img.name = f"{uuid.uuid4()}.jpg"
            image = background_img
            type = 'Video'

        status_instance = Status.objects.create(user=user, image=image, video=video, caption=caption, )   
        
        statuses = Status.objects.filter(user=user)
        status_count = statuses.count()
        viewed_count = StatusView.objects.filter(viewer=user, status__user = user).count()

        unviewed_count = status_count - viewed_count 

        local_timestamps = localtime(status_instance.created_at)
        send_data = {'id':status_instance.id, 'type': type, 'Upload_time': relative_time(local_timestamps), 'total_count_status':status_count, 'unviewed_count':unviewed_count}
       
        return JsonResponse({'status':'200', 'message': send_data, 'user_id':user_id, 'user_contacts':user.contacts}, status=200)

    return JsonResponse({'error': 'Invalid request'}, status=400)

def get_My_status(request, user_id):
    if request.method == 'GET':
        user = User.objects.get(id=user_id)
        
        statuses = Status.objects.filter(user=user)
        
        
        send_status = []

        for status in statuses:
            
            has_been_viewed  = StatusView.objects.filter(status=status,  viewer=request.user,).exists()

            send_status.append({
                'image_url': status.image.url if status.image else None, 
                'video_url':status.video.url if status.video else None, 
                'caption':status.caption,
                'id':status.id,
                'is_viewed': has_been_viewed})
            
        status_count = statuses.count()    
        viewed_count = StatusView.objects.filter(viewer=user, status__user = user).count()
        unviewed_code = status_count - viewed_count
        
        upload_time = ''
        if send_status:
            last_status = Status.objects.filter(user=user).order_by('-created_at').first()
            upload_time = localtime(last_status.created_at)
            

        return JsonResponse({'status':'200', 'message': send_status, 'total_status':status_count, 'unviewed_code':unviewed_code, 'Upload_time': relative_time(upload_time),}, status=200)
        
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def add_viewed_status(request):

    if request.method == 'POST':
        json_data=json.loads(request.body)
        status_id = json_data.get('status_id')
        viewer_id = request.user.id


        viewer_user = User.objects.get(id=viewer_id)
        status = Status.objects.get(id=status_id)

        if StatusView.objects.filter(status=status, viewer=viewer_user).exists():
                return JsonResponse({'status':'400', 'message': 'Already added data'}, status=200)            

        StatusView.objects.create(status=status, viewer=viewer_user)
        
        return JsonResponse({'status':'200', 'message': 'status change successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)    


def get_recent_status(request):
    if request.method == 'GET':
        user_contacts = request.user.contacts

        user_id = request.user.id
        user =  User.objects.get(id=user_id) 

        show_contact_status = []         

        for contact in user_contacts:
            contact_user_id  = contact["user_id"]
            
            if contact_user_id != user_id:
                contact_user = User.objects.get(id=contact_user_id)
                contact_name = contact_user.username

                contact_user_status = Status.objects.filter(user=contact_user)
                status_count = contact_user_status.count()
                

        
                viewed_count = StatusView.objects.filter(viewer=user, status__user = contact_user).count()
                unviewed_count = status_count - viewed_count

                last_status = contact_user_status.order_by('-created_at').first()
                final_time = ''
                if last_status:
                    get_local_time = localtime(last_status.created_at)
                    final_time = relative_time(get_local_time)
                 
                if   status_count > 0:  
                     
                    show_contact_status.append({
                        'image_url': contact_user.profile_image.url if contact_user.profile_image else '',
                        'name':contact_name,
                        'totalStatus':status_count,
                        'unviewed_count':unviewed_count,
                        'time':final_time,
                        'id':contact_user_id,
                    })


        # This my status uploaded check functionality
        statuses = Status.objects.filter(user=user)
        statuses_count =  statuses.count()
        my_viewed_status_count = StatusView.objects.filter(viewer=user,status__user = user).count()
        my_status_unviewed_counts = statuses_count - my_viewed_status_count
       

        my_status_upload_time = ''
        if statuses:
            my_last_status = statuses.order_by('-created_at').first()
            get_localTime = localtime(my_last_status.created_at)
            my_status_upload_time = relative_time(get_localTime)
            
        
        mystatus_data = {
            'mystatus_count':statuses_count, 
            'mystatus_unviewed_count':my_status_unviewed_counts,
            'my_status_upload_time':my_status_upload_time,
        }
         
        
        return JsonResponse({'status':'200', 'message': show_contact_status, 'mystatus_data':mystatus_data, }, status=200)

    return JsonResponse({'error': 'Invalid request'}, status=400)