from rest_framework import serializers
from .models import Post, Tag, TrendingTag
from apps.users.serializers import UserSerializer

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    like_count = serializers.IntegerField(read_only=True)
    hug_count = serializers.IntegerField(read_only=True)
    relate_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_hugged = serializers.SerializerMethodField()
    is_related = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'content', 'tags', 'tag_names',
            'like_count', 'hug_count', 'relate_count',
            'is_liked', 'is_hugged', 'is_related',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_hugged(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.hugs.filter(id=request.user.id).exists()
        return False

    def get_is_related(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.relates.filter(id=request.user.id).exists()
        return False

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        post = Post.objects.create(**validated_data)
        
        # Create or get tags
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(
                name=tag_name.lower(),
                defaults={'slug': tag_name.lower().replace(' ', '-')}
            )
            post.tags.add(tag)
            
            # Update trending tag stats
            trending_tag, created = TrendingTag.objects.get_or_create(tag=tag)
            trending_tag.post_count += 1
            trending_tag.save()
        
        return post

class TrendingTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    
    class Meta:
        model = TrendingTag
        fields = ['tag', 'post_count', 'last_updated'] 