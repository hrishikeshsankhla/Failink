"""
URL configuration for the feed app.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Main feed endpoints
    path('', views.FeedView.as_view(), name='feed'),
    path('trending/', views.TrendingFeedView.as_view(), name='trending_feed'),
    path('following/', views.FollowingFeedView.as_view(), name='following_feed'),
    path('stats/', views.feed_stats, name='feed_stats'),
] 