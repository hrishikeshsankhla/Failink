"""
Views for the feed app.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Count
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from apps.posts.models import Post, Tag
from apps.posts.serializers import PostSerializer
from apps.posts.pagination import PostPagination
from apps.users.models import User
import logging

logger = logging.getLogger(__name__)

class FeedView(generics.ListAPIView):
    """
    Main feed view that displays posts for the authenticated user.
    Supports filtering by tags, search, and sorting options.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        """
        Get posts for the feed with various filtering options.
        """
        queryset = Post.objects.all().select_related('author').prefetch_related(
            'tags', 'likes', 'hugs', 'relates', 'emoji_reactions'
        )
        
        # Get query parameters
        search = self.request.query_params.get('search', None)
        tags = self.request.query_params.get('tags', None)
        sort_by = self.request.query_params.get('sort', 'latest')  # latest, popular, trending
        author_id = self.request.query_params.get('author', None)
        
        # Filter by search term
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()
        
        # Filter by tags
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            if tag_list:
                queryset = queryset.filter(tags__name__in=tag_list).distinct()
        
        # Filter by author
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        # Apply sorting
        if sort_by == 'popular':
            # Sort by total reactions (likes + hugs + relates + emoji reactions)
            queryset = queryset.annotate(
                total_reactions=Count('likes') + Count('hugs') + Count('relates') + Count('emoji_reactions')
            ).order_by('-total_reactions', '-created_at')
        elif sort_by == 'trending':
            # Sort by recent activity (posts with recent reactions)
            week_ago = timezone.now() - timedelta(days=7)
            queryset = queryset.annotate(
                recent_reactions=Count('emoji_reactions', filter=Q(emoji_reactions__created_at__gte=week_ago))
            ).order_by('-recent_reactions', '-created_at')
        else:
            # Default: sort by latest
            queryset = queryset.order_by('-created_at')
        
        return queryset

    def get(self, request, *args, **kwargs):
        """
        Get feed posts with additional metadata.
        """
        try:
            # Get the paginated queryset
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response_data = self.get_paginated_response(serializer.data)
                
                # Add feed metadata
                response_data.data['feed_info'] = {
                    'total_posts': queryset.count(),
                    'search_applied': bool(request.query_params.get('search')),
                    'tags_applied': bool(request.query_params.get('tags')),
                    'sort_by': request.query_params.get('sort', 'latest')
                }
                
                return response_data
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in feed view: {str(e)}")
            return Response(
                {'error': 'Failed to load feed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TrendingFeedView(generics.ListAPIView):
    """
    Trending feed that shows posts with high engagement in the last 7 days.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        """
        Get trending posts based on recent engagement.
        """
        # Get posts from the last 7 days with high engagement
        week_ago = timezone.now() - timedelta(days=7)
        
        queryset = Post.objects.filter(
            created_at__gte=week_ago
        ).select_related('author').prefetch_related(
            'tags', 'likes', 'hugs', 'relates', 'emoji_reactions'
        ).annotate(
            total_reactions=Count('likes') + Count('hugs') + Count('relates') + Count('emoji_reactions')
        ).filter(
            total_reactions__gt=0  # Only posts with reactions
        ).order_by('-total_reactions', '-created_at')
        
        return queryset

class FollowingFeedView(generics.ListAPIView):
    """
    Feed showing posts from users that the current user follows.
    Note: This requires implementing a following system.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        """
        Get posts from followed users.
        For now, return recent posts from all users (placeholder for following system).
        """
        # TODO: Implement following system
        # For now, return recent posts from all users
        return Post.objects.all().select_related('author').prefetch_related(
            'tags', 'likes', 'hugs', 'relates', 'emoji_reactions'
        ).order_by('-created_at')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def feed_stats(request):
    """
    Get feed statistics and metadata.
    """
    try:
        total_posts = Post.objects.count()
        total_users = User.objects.count()
        
        # Get recent activity
        week_ago = timezone.now() - timedelta(days=7)
        recent_posts = Post.objects.filter(created_at__gte=week_ago).count()
        
        # Get trending tags
        trending_tags = Tag.objects.annotate(
            post_count=Count('posts', filter=Q(posts__created_at__gte=week_ago))
        ).filter(post_count__gt=0).order_by('-post_count')[:5]
        
        stats = {
            'total_posts': total_posts,
            'total_users': total_users,
            'recent_posts': recent_posts,
            'trending_tags': [
                {'name': tag.name, 'post_count': tag.post_count}
                for tag in trending_tags
            ]
        }
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error getting feed stats: {str(e)}")
        return Response(
            {'error': 'Failed to get feed statistics'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 