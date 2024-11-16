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
       path('upload-video/',views.upload_videos),
       path('edit_profile/', views.edit_profile),
       path('upload_status/',views.upload_status),
       path('get_My_status/', views.get_My_status),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
 


