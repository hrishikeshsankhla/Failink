import React, { useState, useEffect } from 'react';
import PostCard from '../components/Feed/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import api from '../lib/axios';
import Sidebar from '../components/Feed/Sidebar';
import ChatWidget from '../components/Feed/ChatWidget';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    profile_picture?: string;
  };
  tags: Tag[];
  created_at: string;
  like_count: number;
  hug_count: number;
  relate_count: number;
  is_liked: boolean;
  is_hugged: boolean;
  is_related: boolean;
  user_emoji_reactions: string[];
  emoji_reactions: { [key: string]: number };
  laugh_count: number;
  fire_count: number;
  check_count: number;
}

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [postsRes] = await Promise.all([
        api.get<Post[]>('/posts/'),
        api.get<Tag[]>('/posts/trending-tags/')
      ]);
      
      // Ensure we're setting arrays
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    } catch (err) {
      setError('Failed to load feed data');
      console.error('Error fetching feed data:', err);
      // Initialize with empty arrays in case of error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReaction = async (postId: string, reactionType: 'like' | 'hug' | 'relate') => {
    try {
      await api.post<{ status: string }>(`/posts/${postId}/${reactionType}/`);
      // Refresh the post data
      const updatedPost = await api.get<Post>(`/posts/${postId}/`);
      setPosts(posts.map(post => 
        post.id === postId ? updatedPost.data : post
      ));
    } catch (err) {
      console.error(`Failed to ${reactionType} post:`, err);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="pt-10 pl-8">
        <Sidebar />
      </div>
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <CreatePost onPostCreated={handlePostCreated} />
          <div className="space-y-4 mt-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onReaction={handleReaction}
              />
            ))}
          </div>
        </div>
      </main>
      <div className="pt-10">
        <ChatWidget />
      </div>
    </div>
  );
};

export default FeedPage; 