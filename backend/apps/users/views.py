from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from django.db import models
from django.db.models import Q, Count, Sum
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.provider import GoogleProvider
from allauth.socialaccount.helpers import complete_social_login
from allauth.socialaccount.models import SocialAccount
from .serializers import UserSerializer, UserRegistrationSerializer, SocialAuthSerializer, UserProfileUpdateSerializer
from apps.posts.serializers import PostSerializer
from apps.posts.models import Post, EmojiReaction
from apps.posts.pagination import PostPagination
import logging
import requests
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils import timezone
from rest_framework import serializers

logger = logging.getLogger(__name__)
User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            logger.info(f"User registered successfully: {user.email}")
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            logger.warning(f"Registration validation error: {e.detail}")
            return Response({
                'error': 'Validation failed',
                'details': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error during registration: {str(e)}")
            return Response({
                'error': 'An unexpected error occurred during registration'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserLoginView(generics.CreateAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)

        if not email or not password:
            return Response(
                {'error': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response(
                    {'error': 'This account has been deactivated. Please contact support.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                # Set token expiration based on remember_me
                if remember_me:
                    refresh.set_exp(lifetime=timedelta(days=30))  # 30 days
                else:
                    refresh.set_exp(lifetime=timedelta(days=1))   # 1 day
                
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            else:
                logger.warning(f"Failed login attempt for email: {email}")
                return Response(
                    {'error': 'Invalid email or password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            logger.warning(f"Login attempt for non-existent email: {email}")
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleLoginView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = SocialAuthSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get the access token from the request
            access_token = serializer.validated_data['access_token']
            
            # Verify the token with Google
            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if response.status_code != 200:
                logger.error(f"Google API error: {response.text}")
                return Response(
                    {'error': 'Invalid Google token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_info = response.json()
            logger.info(f"Google user info: {user_info}")
            
            # Get or create the user
            try:
                social_account = SocialAccount.objects.get(
                    provider='google',
                    uid=user_info['sub']
                )
                user = social_account.user
                logger.info(f"Found existing user: {user.email}")
            except SocialAccount.DoesNotExist:
                # Create a new user
                email = user_info.get('email')
                if not email:
                    return Response(
                        {'error': 'Email is required from Google'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    user = User.objects.get(email=email)
                    logger.info(f"Found user with email: {email}")
                except User.DoesNotExist:
                    username = email.split('@')[0]
                    # Ensure username is unique
                    base_username = username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1
                    
                    user = User.objects.create_user(
                        email=email,
                        username=username,
                        profile_picture=user_info.get('picture', '')
                    )
                    logger.info(f"Created new user: {user.email}")
                
                # Create social account
                SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=user_info['sub'],
                    extra_data=user_info
                )
                logger.info(f"Created social account for user: {user.email}")
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Google login error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PasswordResetRequestView(generics.CreateAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Please provide an email address'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            # Generate a reset token
            token = get_random_string(length=32)
            user.password_reset_token = token
            user.password_reset_token_created = timezone.now()
            user.save()

            # Send reset email
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                'Password Reset Request',
                f'Click the following link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({
                'message': 'Password reset instructions have been sent to your email'
            })
        except User.DoesNotExist:
            # Don't reveal that the email doesn't exist
            return Response({
                'message': 'If an account exists with this email, you will receive password reset instructions'
            })
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
            return Response(
                {'error': 'Failed to send reset email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetConfirmView(generics.CreateAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        password = request.data.get('password')
        password2 = request.data.get('password2')

        if not all([token, password, password2]):
            return Response(
                {'error': 'Please provide token, password, and password confirmation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != password2:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(password_reset_token=token)
            # Check if token is expired (24 hours)
            if timezone.now() - user.password_reset_token_created > timedelta(hours=24):
                return Response(
                    {'error': 'Password reset token has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update password and clear reset token
            user.set_password(password)
            user.password_reset_token = None
            user.password_reset_token_created = None
            user.save()

            return Response({
                'message': 'Password has been reset successfully'
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error resetting password: {str(e)}")
            return Response(
                {'error': 'Failed to reset password. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserPostsView(generics.ListAPIView):
    """Get posts created by a specific user"""
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            return Post.objects.filter(author_id=user_id).select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')
        return Post.objects.none()

class UserReactionsView(generics.ListAPIView):
    """Get posts that a user has reacted to"""
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        reaction_type = self.request.query_params.get('type', 'all')  # like, hug, relate, emoji
        
        if not user_id:
            return Post.objects.none()
        
        if reaction_type == 'like':
            return Post.objects.filter(likes__id=user_id).select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')
        elif reaction_type == 'hug':
            return Post.objects.filter(hugs__id=user_id).select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')
        elif reaction_type == 'relate':
            return Post.objects.filter(relates__id=user_id).select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')
        elif reaction_type == 'emoji':
            return Post.objects.filter(emoji_reactions__user_id=user_id).select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')
        else:
            # Return all posts user has reacted to in any way
            return Post.objects.filter(
                Q(likes__id=user_id) |
                Q(hugs__id=user_id) |
                Q(relates__id=user_id) |
                Q(emoji_reactions__user_id=user_id)
            ).distinct().select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')

class UserStatsView(generics.RetrieveAPIView):
    """Get user statistics for profile page"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user_id = self.kwargs.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Optimize queries using database aggregation instead of Python loops
        # Get user's posts with reaction counts in a single query
        user_posts_stats = Post.objects.filter(author=user).aggregate(
            posts_count=Count('id'),
            total_likes_received=Count('likes'),
            total_hugs_received=Count('hugs'),
            total_relates_received=Count('relates'),
        )
        
        # Get emoji reactions received in a single query
        emoji_reactions_received = EmojiReaction.objects.filter(post__author=user).count()
        
        # Get user's reactions given in optimized queries
        user_likes_given = Post.objects.filter(likes=user).count()
        user_hugs_given = Post.objects.filter(hugs=user).count()
        user_relates_given = Post.objects.filter(relates=user).count()
        user_emoji_reactions_given = EmojiReaction.objects.filter(user=user).count()
        
        stats = {
            'posts_count': user_posts_stats['posts_count'],
            'likes_received': user_posts_stats['total_likes_received'],
            'hugs_received': user_posts_stats['total_hugs_received'],
            'relates_received': user_posts_stats['total_relates_received'],
            'emoji_reactions_received': emoji_reactions_received,
            'likes_given': user_likes_given,
            'hugs_given': user_hugs_given,
            'relates_given': user_relates_given,
            'emoji_reactions_given': user_emoji_reactions_given,
            'total_reactions_received': (
                user_posts_stats['total_likes_received'] + 
                user_posts_stats['total_hugs_received'] + 
                user_posts_stats['total_relates_received'] + 
                emoji_reactions_received
            ),
            'total_reactions_given': (
                user_likes_given + 
                user_hugs_given + 
                user_relates_given + 
                user_emoji_reactions_given
            ),
        }
        
        return Response(stats)

class UserProfileUpdateView(generics.UpdateAPIView):
    """Update user profile information"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileUpdateSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            logger.info(f"User profile updated successfully: {user.email}")
            
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Profile updated successfully'
            }, status=status.HTTP_200_OK)
        except serializers.ValidationError as e:
            logger.warning(f"Profile update validation error: {e.detail}")
            return Response({
                'error': 'Validation failed',
                'details': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error during profile update: {str(e)}")
            return Response({
                'error': 'An unexpected error occurred while updating profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SuggestedUsersView(generics.ListAPIView):
    """Get suggested users for the current user"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        current_user = self.request.user
        
        # Get users who are not the current user and have some activity
        # For now, return users who have created posts
        from apps.posts.models import Post
        
        active_users = User.objects.filter(
            posts__isnull=False
        ).exclude(
            id=current_user.id
        ).distinct().order_by('-date_joined')[:10]
        
        # If not enough active users, add some recent users
        if active_users.count() < 5:
            recent_users = User.objects.exclude(
                id__in=active_users.values_list('id', flat=True)
            ).exclude(
                id=current_user.id
            ).order_by('-date_joined')[:5]
            
            active_users = list(active_users) + list(recent_users)
        
        return active_users[:10]

class UserDetailView(generics.RetrieveAPIView):
    """Get a specific user's profile by ID"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'
    
    def get_queryset(self):
        return User.objects.all()

# Create your views here. 