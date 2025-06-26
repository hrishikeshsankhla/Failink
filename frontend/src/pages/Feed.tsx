import React, { useState, useEffect } from 'react';
import PostCard from '../components/Feed/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import Sidebar from '../components/Feed/Sidebar';
import ChatWidget from '../components/Feed/ChatWidget';
import { postsAPI, type Post } from '../api';

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [postsRes] = await Promise.all([
        postsAPI.getAll(),
        postsAPI.getTrendingTags()
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
      await postsAPI[reactionType](postId);
      // Refresh the post data
      const updatedPost = await postsAPI.getById(postId);
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