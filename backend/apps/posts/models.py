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

class TrendingTag(models.Model):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='trending_stats')
    post_count = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-post_count']
    
    def __str__(self):
        return f"{self.tag.name} ({self.post_count} posts)" 