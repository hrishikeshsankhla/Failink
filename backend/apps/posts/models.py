from django.db import models
from django.conf import settings
import uuid

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    tags = models.ManyToManyField(Tag, related_name='posts')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    hugs = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='hugged_posts', blank=True)
    relates = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='related_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
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
    
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='emoji_reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='emoji_reactions')
    emoji = models.CharField(max_length=2, choices=EMOJI_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'user', 'emoji')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} reacted with {self.emoji} to {self.post.title}"

class TrendingTag(models.Model):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='trending_stats')
    post_count = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-post_count']
    
    def __str__(self):
        return f"{self.tag.name} ({self.post_count} posts)"

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"

    @property
    def has_children(self):
        return self.replies.exists() 