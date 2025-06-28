from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserProfileView, GoogleLoginView, UserLoginView,
    PasswordResetRequestView, PasswordResetConfirmView, UserPostsView, 
    UserReactionsView, UserStatsView, UserProfileUpdateView, SuggestedUsersView, UserDetailView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('suggested/', SuggestedUsersView.as_view(), name='suggested_users'),
    
    # Profile-related endpoints
    path('<str:user_id>/', UserDetailView.as_view(), name='user_detail'),
    path('<str:user_id>/posts/', UserPostsView.as_view(), name='user_posts'),
    path('<str:user_id>/reactions/', UserReactionsView.as_view(), name='user_reactions'),
    path('<str:user_id>/stats/', UserStatsView.as_view(), name='user_stats'),
] 