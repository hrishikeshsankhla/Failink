from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserProfileView, GoogleLoginView, UserLoginView,
    PasswordResetRequestView, PasswordResetConfirmView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
] 