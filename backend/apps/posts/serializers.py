from rest_framework import serializers
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils.text import slugify
from .models import Post, Tag, TrendingTag, EmojiReaction, Comment, PostMedia
from apps.users.serializers import UserSerializer
import re

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description']

class EmojiReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmojiReaction
        fields = ['emoji', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']

class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['id', 'file', 'uploaded_at']

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
    laugh_count = serializers.IntegerField(read_only=True)
    fire_count = serializers.IntegerField(read_only=True)
    check_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_hugged = serializers.SerializerMethodField()
    is_related = serializers.SerializerMethodField()
    user_emoji_reactions = serializers.SerializerMethodField()
    media = PostMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'content', 'tags', 'tag_names',
            'like_count', 'hug_count', 'relate_count',
            'laugh_count', 'fire_count', 'check_count',
            'is_liked', 'is_hugged', 'is_related',
            'user_emoji_reactions',
            'created_at', 'updated_at',
            'media',
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'media']

    def validate_title(self, value):
        """Validate post title"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be no more than 200 characters.")
        return value.strip()

    def validate_content(self, value):
        """Validate post content"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Content must be at least 10 characters long.")
        if len(value) > 10000:
            raise serializers.ValidationError("Content must be no more than 10,000 characters.")
        return value.strip()

    def validate_tag_names(self, value):
        """Validate tag names"""
        if not value:
            return []
        
        # Limit number of tags
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 tags allowed.")
        
        # Validate each tag
        validated_tags = []
        for tag_name in value:
            tag_name = tag_name.strip()
            if len(tag_name) < 2:
                raise serializers.ValidationError(f"Tag '{tag_name}' must be at least 2 characters long.")
            if len(tag_name) > 50:
                raise serializers.ValidationError(f"Tag '{tag_name}' must be no more than 50 characters.")
            
            # Remove HTML characters and normalize
            tag_name = re.sub(r'[<>"\']', '', tag_name)
            if tag_name and tag_name not in validated_tags:
                validated_tags.append(tag_name.lower())
        
        return validated_tags

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

    def get_user_emoji_reactions(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return list(obj.emoji_reactions.filter(user=request.user).values_list('emoji', flat=True))
        return []

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        post = Post.objects.create(**validated_data)
        
        # Create or get tags
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(
                name=tag_name,
                defaults={'slug': slugify(tag_name)}
            )
            post.tags.add(tag)
            
            # Update trending tag stats
            trending_tag, created = TrendingTag.objects.get_or_create(tag=tag)
            trending_tag.post_count += 1
            trending_tag.save()
        
        return post

    def update(self, instance, validated_data):
        """Update post and handle tag changes."""
        tag_names = validated_data.pop('tag_names', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle tag updates if provided
        if tag_names is not None:
            # Clear existing tags
            instance.tags.clear()
            
            # Add new tags
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'slug': slugify(tag_name)}
                )
                instance.tags.add(tag)
                
                # Update trending tag stats
                trending_tag, created = TrendingTag.objects.get_or_create(tag=tag)
                trending_tag.post_count += 1
                trending_tag.save()
        
        return instance

class TrendingTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    
    class Meta:
        model = TrendingTag
        fields = ['tag', 'post_count', 'last_updated']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'content', 'parent', 'created_at', 'updated_at', 'replies'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'replies']

    def validate_content(self, value):
        """Validate comment content"""
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Comment cannot be empty.")
        if len(value) > 2000:
            raise serializers.ValidationError("Comment must be no more than 2,000 characters.")
        return value.strip()

    def get_replies(self, obj):
        # Only return replies if any exist
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

    def validate(self, data):
        parent = data.get('parent')
        post = self.context.get('post')
        if parent and parent.post != post:
            raise serializers.ValidationError('Parent comment must belong to the same post.')
        return data 