from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Post, Tag
import uuid
from django.core.files.uploadedfile import SimpleUploadedFile

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
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
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

    def test_update_own_post(self):
        data = {
            'title': 'Updated Post',
            'content': 'Updated Content',
            'tag_names': ['updated', 'test']
        }
        response = self.client.patch(f'/api/posts/{self.post.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated Post')
        self.assertEqual(self.post.content, 'Updated Content')

    def test_update_other_user_post(self):
        other_post = Post.objects.create(
            author=self.other_user,
            title='Other Post',
            content='Other Content'
        )
        data = {
            'title': 'Hacked Post',
            'content': 'Hacked Content'
        }
        response = self.client.patch(f'/api/posts/{other_post.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_own_post(self):
        response = self.client.delete(f'/api/posts/{self.post.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Post.objects.count(), 0)

    def test_delete_other_user_post(self):
        other_post = Post.objects.create(
            author=self.other_user,
            title='Other Post',
            content='Other Content'
        )
        response = self.client.delete(f'/api/posts/{other_post.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Post.objects.count(), 2)  # Both posts still exist

    def test_like_post(self):
        response = self.client.post(f'/api/posts/{self.post.id}/like/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'liked')
        self.assertEqual(self.post.like_count, 1)

    def test_create_post_with_media(self):
        image = SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg")
        data = {
            'title': 'Post with Media',
            'content': 'This post has an image.',
            'tag_names': ['media'],
            'media': [image],
        }
        response = self.client.post('/api/posts/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)
        post = Post.objects.last()
        self.assertTrue(post.media.exists()) 