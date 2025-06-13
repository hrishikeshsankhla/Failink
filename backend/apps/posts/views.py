from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.core.cache import cache
from django.conf import settings
from .models import Post, Tag, TrendingTag, EmojiReaction, Comment
from .serializers import PostSerializer, TagSerializer, TrendingTagSerializer, CommentSerializer
from .pagination import CommentPagination, PostPagination
import logging
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import PermissionDenied

logger = logging.getLogger(__name__)

# Create your views here. 

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.all().select_related('author').prefetch_related('tags', 'likes', 'hugs', 'relates')
        
        # Filter by followed tags if provided
        followed_tags = self.request.query_params.get('followed_tags', None)
        if followed_tags:
            tag_ids = followed_tags.split(',')
            queryset = queryset.filter(tags__id__in=tag_ids).distinct()
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        if request.user in post.likes.all():
            post.likes.remove(request.user)
            return Response({'status': 'unliked'})
        post.likes.add(request.user)
        return Response({'status': 'liked'})

    @action(detail=True, methods=['post'])
    def hug(self, request, pk=None):
        post = self.get_object()
        if request.user in post.hugs.all():
            post.hugs.remove(request.user)
            return Response({'status': 'unhugged'})
        post.hugs.add(request.user)
        return Response({'status': 'hugged'})

    @action(detail=True, methods=['post'])
    def relate(self, request, pk=None):
        post = self.get_object()
        if request.user in post.relates.all():
            post.relates.remove(request.user)
            return Response({'status': 'unrelated'})
        post.relates.add(request.user)
        return Response({'status': 'related'})

    @action(detail=True, methods=['post'])
    def emoji_react(self, request, pk=None):
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
                {'error': 'Invalid emoji'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        # Only top-level comments
        return Comment.objects.filter(post__id=post_id, parent=None).select_related('user').prefetch_related('replies')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        post_id = self.kwargs.get('post_pk') or self.kwargs.get('post_id')
        context['post'] = Post.objects.get(id=post_id)
        return context

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_pk') or self.kwargs.get('post_id')
        post = Post.objects.get(id=post_id)
        serializer.save(user=self.request.user, post=post)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not request.user.is_staff:
            raise PermissionDenied('You do not have permission to delete this comment.')
        return super().destroy(request, *args, **kwargs) 