from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from .models import Post, Tag, TrendingTag
from .serializers import PostSerializer, TagSerializer, TrendingTagSerializer
import logging

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

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def trending_tags(request):
    """
    Get the top 10 trending tags.
    """
    logger.debug("trending_tags view called")
    try:
        trending_tags = TrendingTag.objects.select_related('tag').all()[:10]
        logger.debug("Found %d trending tags", len(trending_tags))
        serializer = TrendingTagSerializer(trending_tags, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error("Error in trending_tags view: %s", str(e))
        return Response(
            {"error": "Failed to fetch trending tags"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 