from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Post, Tag
import uuid

User = get_user_model()

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.post = Post.objects.create(
            author=self.user,
            title='Test Post',
            content='Test Content'
        )

    def test_post_creation(self):
        self.assertEqual(self.post.title, 'Test Post')
        self.assertEqual(self.post.content, 'Test Content')
        self.assertEqual(self.post.author, self.user)
        self.assertTrue(isinstance(self.post.id, uuid.UUID))

    def test_post_reactions(self):
        self.assertEqual(self.post.like_count, 0)
        self.assertEqual(self.post.hug_count, 0)
        self.assertEqual(self.post.relate_count, 0)

class PostAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.post = Post.objects.create(
            author=self.user,
            title='Test Post',
            content='Test Content'
        )

    def test_create_post(self):
        data = {
            'title': 'New Post',
            'content': 'New Content',
            'tag_names': ['test', 'api']
        }
        response = self.client.post('/api/posts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    def test_like_post(self):
        response = self.client.post(f'/api/posts/{self.post.id}/like/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'liked')
        self.assertEqual(self.post.like_count, 1) 