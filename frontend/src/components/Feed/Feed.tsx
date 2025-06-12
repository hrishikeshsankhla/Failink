import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import TrendingTags from './TrendingTags';
import SuggestedUsers from './SuggestedUsers';
import CreatePost from './CreatePost';
import api from '../../lib/axios';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  is_liked?: boolean;
  is_roasted?: boolean;
  likes_count: number;
  roasts_count: number;
  tags: string[];
}

interface Tag {
  id: number;
  name: string;
  post_count: number;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [postsRes, tagsRes] = await Promise.all([
        api.get<Post[]>('/posts/'),
        api.get<Tag[]>('/posts/trending-tags/')
      ]);
      
      // Ensure we're setting arrays
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      setTrendingTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
    } catch (err) {
      setError('Failed to load feed data');
      console.error('Error fetching feed data:', err);
      // Initialize with empty arrays in case of error
      setPosts([]);
      setTrendingTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReaction = async (postId: number, reactionType: 'like' | 'roast') => {
    try {
      const response = await api.post<{ status: 'like' | 'roast' | null }>(`/posts/${postId}/${reactionType}/`);
      // Update the post in the state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, [`is_${reactionType}`]: response.data.status === reactionType } 
          : post
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Trending Tags */}
        <div className="col-span-3">
          <TrendingTags tags={trendingTags} />
        </div>

        {/* Main Feed */}
        <div className="col-span-6">
          <CreatePost onPostCreated={handlePostCreated} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReaction={handleReaction}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No posts available. Be the first to share your failure story!
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar - Suggested Users */}
        <div className="col-span-3">
          <SuggestedUsers />
        </div>
      </div>
    </div>
  );
};

export default Feed; 