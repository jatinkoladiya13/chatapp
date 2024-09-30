from django.shortcuts import render, redirect
from app.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from app.email import send_otp_via_email
from .untils import encrypt, decrypt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from app.models import User, Message
from django.db.models import Q
from django.utils.timezone import localtime
from app.formate_date import format_date
from django.db.models import Q
from app.decorator import custom_login_required
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
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
            for contact in create_by_user.contacts:
                if contact['user_id'] == user.id:
                    contact['delete_status'] = False
                    break
                if contact['user_id'] in create_by_user.deleted_contacts:
                    del create_by_user.deleted_contacts[contact['user_id']]
            else:
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

def  delete_contact(request):
    if request.method == 'GET':
        user_id = request.user.id
        user = get_object_or_404(User, id=user_id)

        contact_id = request.GET.get('user_id')
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
        file = request.FILES.get('video')
        receiver_usr = request.POST.get('receiver_usr')
        caption = request.POST.get('captions')
        sender_id = request.user.id

        receiver_msg = User.objects.get(id=receiver_usr)
        sender_msg = User.objects.get(id=sender_id)
        
    
    
        new_filename = f"{uuid.uuid4()}.mp4"
        file.name = new_filename
        msg_instance = Message.objects.create(
                    sender=sender_msg, receiver=receiver_msg, video=file, caption=caption, content='',)
        send_data = {'id':msg_instance.id, 'type': 'Video',}
         
        return JsonResponse({'status':'200', 'message': send_data}, status=200)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)