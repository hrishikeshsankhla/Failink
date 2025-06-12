from django.contrib import admin
from .models import Post, Tag, TrendingTag

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(TrendingTag)
class TrendingTagAdmin(admin.ModelAdmin):
    list_display = ('tag', 'post_count', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('tag__name',)
    date_hierarchy = 'last_updated' 