from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from apps.posts.models import Post, Tag, EmojiReaction
import uuid

User = get_user_model()

class UserProfileAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create some test posts
        self.tag = Tag.objects.create(name='test', slug='test')
        self.post1 = Post.objects.create(
            author=self.user,
            title='Test Post 1',
            content='Test Content 1'
        )
        self.post1.tags.add(self.tag)
        
        self.post2 = Post.objects.create(
            author=self.user,
            title='Test Post 2',
            content='Test Content 2'
        )
        self.post2.tags.add(self.tag)
        
        # Create another user and post
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.other_post = Post.objects.create(
            author=self.other_user,
            title='Other Post',
            content='Other Content'
        )
        
        # Add some reactions
        self.post1.likes.add(self.other_user)
        self.post2.hugs.add(self.other_user)
        EmojiReaction.objects.create(
            post=self.post1,
            user=self.other_user,
            emoji='😂'
        )

    def test_get_user_stats(self):
        """Test getting user statistics"""
        response = self.client.get(f'/api/users/{self.user.id}/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(data['posts_count'], 2)
        self.assertEqual(data['likes_received'], 1)
        self.assertEqual(data['hugs_received'], 1)
        self.assertEqual(data['emoji_reactions_received'], 1)
        self.assertEqual(data['total_reactions_received'], 3)

    def test_get_user_posts(self):
        """Test getting user posts"""
        response = self.client.get(f'/api/users/{self.user.id}/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(len(data['results']), 2)
        self.assertEqual(data['results'][0]['title'], 'Test Post 2')  # Most recent first
        self.assertEqual(data['results'][1]['title'], 'Test Post 1')

    def test_get_user_reactions(self):
        """Test getting posts user has reacted to"""
        response = self.client.get(f'/api/users/{self.other_user.id}/reactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(len(data['results']), 2)  # Should have reacted to 2 posts

    def test_get_user_reactions_by_type(self):
        """Test getting user reactions filtered by type"""
        # Test likes
        response = self.client.get(f'/api/users/{self.other_user.id}/reactions/?type=like')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # Test hugs
        response = self.client.get(f'/api/users/{self.other_user.id}/reactions/?type=hug')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # Test emoji reactions
        response = self.client.get(f'/api/users/{self.other_user.id}/reactions/?type=emoji')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_nonexistent_user_stats(self):
        """Test getting stats for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = self.client.get(f'/api/users/{fake_id}/stats/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_nonexistent_user_posts(self):
        """Test getting posts for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = self.client.get(f'/api/users/{fake_id}/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_unauthorized_access(self):
        """Test that unauthenticated users cannot access profile endpoints"""
        self.client.force_authenticate(user=None)
        
        response = self.client.get(f'/api/users/{self.user.id}/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get(f'/api/users/{self.user.id}/posts/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get(f'/api/users/{self.user.id}/reactions/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) 