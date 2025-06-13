from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from . import views
import logging

logger = logging.getLogger(__name__)

router = DefaultRouter()
router.register(r'', views.PostViewSet, basename='post')

# Nested router for comments under posts
posts_router = NestedDefaultRouter(router, r'', lookup='post')
posts_router.register(r'comments', views.CommentViewSet, basename='post-comments')

# Define URL patterns
urlpatterns = [
    path('trending-tags/', views.trending_tags, name='trending-tags'),
    path('', include(router.urls)),  # Include main router URLs first
    path('', include(posts_router.urls)),  # Include nested comments URLs after
]

# Debug logging
logger.debug("Posts URL patterns: %s", urlpatterns) 