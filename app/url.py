from django.urls import path
from app import views
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
       path('', views.home, name='home'),
       path('register/', views.register, name='register'),
       path('login/', views.loginpage, name='login'),
       path('sendlink/', views.sendOTP, name='sendlink'),
       path('changepassword/', views.changepassword, name='changepassword'), 
       path('signout/',views.logouts, name="signout"),
       path('verifyotp/', views.verifyotp, name='verifyotp'),
      

       # API's
       path('resendotp/', views.resendotp, name='resendotp'),
       path('create_contacts/',views.create_contacts),
       path('get_contacts/', views.get_contacts),
       path('delete_contact/<int:contact_id>/',views.delete_contact),
       path('upload-video/',views.upload_videos),
       path('edit_profile/', views.edit_profile),
       path('upload_status/',views.upload_status),
       path('get_My_status/<int:user_id>/', views.get_My_status),
       path('add_viewed_status/',views.add_viewed_status),
       path('get_recent_status/',views.get_recent_status),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
 


