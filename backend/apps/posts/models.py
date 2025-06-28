from django.db import models
from django.conf import settings
import uuid
from django.core.exceptions import ValidationError
import mimetypes

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, db_index=True)
    slug = models.SlugField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.name

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts', db_index=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    tags = models.ManyToManyField(Tag, related_name='posts')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    hugs = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='hugged_posts', blank=True)
    relates = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='related_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['created_at']),
            models.Index(fields=['author', 'created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def like_count(self):
        return self.likes.count()
    
    @property
    def hug_count(self):
        return self.hugs.count()
    
    @property
    def relate_count(self):
        return self.relates.count()
    
    @property
    def laugh_count(self):
        return self.emoji_reactions.filter(emoji='😂').count()
    
    @property
    def fire_count(self):
        return self.emoji_reactions.filter(emoji='🔥').count()
    
    @property
    def check_count(self):
        return self.emoji_reactions.filter(emoji='✅').count()

class EmojiReaction(models.Model):
    EMOJI_CHOICES = [
        ('😂', 'Laugh'),
        ('🔥', 'Fire'),
        ('✅', 'Check'),
    ]
    
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='emoji_reactions', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='emoji_reactions', db_index=True)
    emoji = models.CharField(max_length=2, choices=EMOJI_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        unique_together = ('post', 'user', 'emoji')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
            models.Index(fields=['emoji']),
            models.Index(fields=['post', 'user']),
            models.Index(fields=['post', 'emoji']),
        ]
    
    def __str__(self):
        return f"{self.user.username} reacted with {self.emoji} to {self.post.title}"

class TrendingTag(models.Model):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='trending_stats', db_index=True)
    post_count = models.IntegerField(default=0, db_index=True)
    last_updated = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        ordering = ['-post_count']
        indexes = [
            models.Index(fields=['tag']),
            models.Index(fields=['post_count']),
            models.Index(fields=['last_updated']),
        ]
    
    def __str__(self):
        return f"{self.tag.name} ({self.post_count} posts)"

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments', db_index=True)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
            models.Index(fields=['parent']),
            models.Index(fields=['created_at']),
            models.Index(fields=['post', 'parent']),
        ]

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"

    @property
    def has_children(self):
        return self.replies.exists()

class PostMedia(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='post_media/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif',
            'video/mp4', 'video/webm', 'video/ogg',
        ]
        mime_type, _ = mimetypes.guess_type(self.file.name)
        if mime_type not in allowed_types:
            raise ValidationError('Unsupported file type.')
        if self.file.size > 10 * 1024 * 1024:  # 10MB limit
            raise ValidationError('File too large (max 10MB).')

    def __str__(self):
        return f"Media for {self.post.title} ({self.file.name})" 