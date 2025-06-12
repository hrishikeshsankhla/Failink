from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
import logging

logger = logging.getLogger(__name__)

router = DefaultRouter()
router.register(r'', views.PostViewSet, basename='post')

# Define URL patterns before including router URLs
urlpatterns = [
    path('trending-tags/', views.trending_tags, name='trending-tags'),
    path('', include(router.urls)),  # Include router URLs last to prevent conflicts
]

# Debug logging
logger.debug("Posts URL patterns: %s", urlpatterns) 