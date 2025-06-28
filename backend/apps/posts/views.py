from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.core.cache import cache
from django.conf import settings
from django.db import transaction
from .models import Post, Tag, TrendingTag, EmojiReaction, Comment, PostMedia
from .serializers import PostSerializer, TagSerializer, TrendingTagSerializer, CommentSerializer
from .pagination import CommentPagination, PostPagination
from .exceptions import InvalidEmojiException, PostNotFound
import logging
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import PermissionDenied, ValidationError

logger = logging.getLogger(__name__)

# Create your views here. 

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.all().select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates', 'media')
        
        # Filter by followed tags if provided
        followed_tags = self.request.query_params.get('followed_tags', None)
        if followed_tags:
            try:
                tag_ids = [int(tag_id.strip()) for tag_id in followed_tags.split(',') if tag_id.strip().isdigit()]
                if tag_ids:
                    queryset = queryset.filter(tags__id__in=tag_ids).distinct()
            except (ValueError, TypeError):
                logger.warning(f"Invalid followed_tags parameter: {followed_tags}")
        
        return queryset

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        files = self.request.FILES.getlist('media')
        for file in files:
            PostMedia.objects.create(post=post, file=file)

    def perform_update(self, serializer):
        """Ensure only the author can update their post."""
        post = self.get_object()
        if post.author != self.request.user:
            raise PermissionDenied('You do not have permission to edit this post.')
        updated_post = serializer.save()
        files = self.request.FILES.getlist('media')
        for file in files:
            PostMedia.objects.create(post=updated_post, file=file)

    def perform_destroy(self, instance):
        """Ensure only the author can delete their post."""
        if instance.author != self.request.user:
            raise PermissionDenied('You do not have permission to delete this post.')
        instance.delete()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        try:
            post = self.get_object()
            if request.user in post.likes.all():
                post.likes.remove(request.user)
                return Response({'status': 'unliked'})
            post.likes.add(request.user)
            return Response({'status': 'liked'})
        except Exception as e:
            logger.error(f"Error in like action: {str(e)}")
            return Response(
                {'error': 'Failed to process like action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def hug(self, request, pk=None):
        try:
            post = self.get_object()
            if request.user in post.hugs.all():
                post.hugs.remove(request.user)
                return Response({'status': 'unhugged'})
            post.hugs.add(request.user)
            return Response({'status': 'hugged'})
        except Exception as e:
            logger.error(f"Error in hug action: {str(e)}")
            return Response(
                {'error': 'Failed to process hug action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def relate(self, request, pk=None):
        try:
            post = self.get_object()
            if request.user in post.relates.all():
                post.relates.remove(request.user)
                return Response({'status': 'unrelated'})
            post.relates.add(request.user)
            return Response({'status': 'related'})
        except Exception as e:
            logger.error(f"Error in relate action: {str(e)}")
            return Response(
                {'error': 'Failed to process relate action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def emoji_react(self, request, pk=None):
        """Handle emoji reactions on posts."""
        try:
            post = self.get_object()
            emoji = request.data.get('emoji')
            
            if not emoji:
                return Response(
                    {'error': 'Emoji is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Validate emoji
            valid_emojis = [choice[0] for choice in EmojiReaction.EMOJI_CHOICES]
            if emoji not in valid_emojis:
                return Response(
                    {'error': f'Invalid emoji. Must be one of: {", ".join(valid_emojis)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            with transaction.atomic():
                # Check if user already reacted with this emoji
                reaction = EmojiReaction.objects.filter(
                    post=post,
                    user=request.user,
                    emoji=emoji
                ).first()
                
                if reaction:
                    # Remove reaction if it exists
                    reaction.delete()
                    return Response({'status': 'removed'})
                
                # Create new reaction
                EmojiReaction.objects.create(
                    post=post,
                    user=request.user,
                    emoji=emoji
                )
                return Response({'status': 'added'})
                
        except Exception as e:
            logger.error(f"Error in emoji_react action: {str(e)}")
            return Response(
                {'error': 'Failed to process emoji reaction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def trending_tags(request):
    """
    Get the top 10 trending tags with caching.
    """
    cache_key = 'trending_tags'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        logger.debug("Returning cached trending tags")
        return Response(cached_data)
    
    try:
        trending_tags = TrendingTag.objects.select_related('tag').all()[:10]
        logger.debug("Found %d trending tags", len(trending_tags))
        serializer = TrendingTagSerializer(trending_tags, many=True)
        data = serializer.data
        
        # Cache for 5 minutes
        cache.set(cache_key, data, 300)
        
        return Response(data)
    except Exception as e:
        logger.error("Error in trending_tags view: %s", str(e))
        return Response(
            {"error": "Failed to fetch trending tags"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class CommentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = CommentPagination

    def get_queryset(self):
        post_id = self.kwargs.get('post_pk') or self.kwargs.get('post_id')
        if not post_id:
            return Comment.objects.none()
        # Only top-level comments
        return Comment.objects.filter(post__id=post_id, parent=None).select_related('user').prefetch_related('replies')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        post_id = self.kwargs.get('post_pk') or self.kwargs.get('post_id')
        try:
            context['post'] = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise PostNotFound('Post not found.')
        return context

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_pk') or self.kwargs.get('post_id')
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise PostNotFound('Post not found.')
        serializer.save(user=self.request.user, post=post)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not request.user.is_staff:
            raise PermissionDenied('You do not have permission to delete this comment.')
        return super().destroy(request, *args, **kwargs) 