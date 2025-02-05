from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from app.models import User
from django.contrib.auth import login
from django.core.exceptions import ValidationError


class MySocialAccountAdapter(DefaultSocialAccountAdapter):
     
    def pre_social_login(self, request, sociallogin):
        email = sociallogin.account.extra_data.get("email")
        
        
        if not email:
            return
        
        try:
            existing_user = User.objects.get(email=email)
            sociallogin.connect(request, existing_user)
        except User.DoesNotExist:
            pass     

    def save_user(self, request, sociallogin, form=None):

        user = super().save_user(request, sociallogin, form)

        email =  sociallogin.account.extra_data.get("email", "") 
        profile_image = sociallogin.account.get_avatar_url()
        full_name = sociallogin.account.extra_data.get("name", "")
       
        if full_name:
            user.username = full_name.replace(" ", "_").lower() 
        

        user.email = email
        user.google_profile_image = profile_image if profile_image else None 
        try:
            user.full_clean()
            user.save()
        except ValidationError as e:
            print(f"Validation error: {e}")
        
        return user            
    
    def get_login_redirect_url(self, request):
        """
        Override the default login redirect URL to ensure users are redirected
        to the correct page after a successful login.
        """
        # If the user is authenticated, redirect to home or any page you want
        return '/'