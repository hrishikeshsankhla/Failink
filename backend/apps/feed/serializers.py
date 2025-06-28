"""
Serializers for the feed app.
"""

from rest_framework import serializers
from apps.posts.models import Post, Tag
from apps.posts.serializers import PostSerializer

class FeedPostSerializer(PostSerializer):
    """
    Extended post serializer for feed with additional feed-specific fields.
    """
    is_trending = serializers.SerializerMethodField()
    engagement_score = serializers.SerializerMethodField()
    
    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['is_trending', 'engagement_score']
    
    def get_is_trending(self, obj):
        """Check if post is trending based on recent engagement."""
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        recent_reactions = obj.emoji_reactions.filter(created_at__gte=week_ago).count()
        return recent_reactions > 5  # Consider trending if more than 5 recent reactions
    
    def get_engagement_score(self, obj):
        """Calculate engagement score based on reactions and comments."""
        total_reactions = obj.like_count + obj.hug_count + obj.relate_count + obj.emoji_reactions.count()
        total_comments = obj.comments.count()
        return total_reactions + (total_comments * 2)  # Comments weighted more

class TrendingTagSerializer(serializers.ModelSerializer):
    """Serializer for trending tags in feed."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'post_count']
    
    post_count = serializers.SerializerMethodField()
    
    def get_post_count(self, obj):
        """Get count of recent posts for this tag."""
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        return obj.posts.filter(created_at__gte=week_ago).count()

class FeedStatsSerializer(serializers.Serializer):
    """Serializer for feed statistics."""
    total_posts = serializers.IntegerField()
    total_users = serializers.IntegerField()
    recent_posts = serializers.IntegerField()
    trending_tags = TrendingTagSerializer(many=True)

# Define your serializers here. 

# TODO: Implement Feed serializers here. 