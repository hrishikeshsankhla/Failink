import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostCard from '../components/Feed/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import Sidebar from '../components/Feed/Sidebar';
import ChatWidget from '../components/Feed/ChatWidget';
import { postsAPI, type Post } from '../api';

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    try {
      setLoading(true);
      setError(null);
      // Fetch posts from the new feed endpoint
      const feedRes = await postsAPI.getFeed();
      setPosts(Array.isArray(feedRes.results) ? feedRes.results : []);
    } catch (err) {
      console.error('Error fetching feed data:', err);
      setError('Failed to load feed data');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReaction = useCallback(async (postId: string, reactionType: 'like' | 'hug' | 'relate' | 'emoji', emoji?: string) => {
    try {
      if (reactionType === 'emoji' && emoji) {
        console.log(`Handling emoji reaction: ${emoji} for post ${postId}`);
        await postsAPI.emojiReact(postId, emoji);
        
        // Update the post locally for emoji reactions
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            const updatedPost = { ...post };
            const userReactions = [...(updatedPost.user_emoji_reactions || [])];
            
            // Check if user already reacted with this emoji
            const hasReaction = userReactions.includes(emoji);
            console.log(`User has reaction ${emoji}: ${hasReaction}`);
            
            if (hasReaction) {
              // Remove reaction
              const index = userReactions.indexOf(emoji);
              userReactions.splice(index, 1);
              
              // Decrease count
              switch (emoji) {
                case '😂':
                  updatedPost.laugh_count = Math.max(0, updatedPost.laugh_count - 1);
                  break;
                case '🔥':
                  updatedPost.fire_count = Math.max(0, updatedPost.fire_count - 1);
                  break;
                case '✅':
                  updatedPost.check_count = Math.max(0, updatedPost.check_count - 1);
                  break;
              }
              console.log(`Removed ${emoji} reaction. New counts:`, {
                laugh: updatedPost.laugh_count,
                fire: updatedPost.fire_count,
                check: updatedPost.check_count
              });
            } else {
              // Add reaction
              userReactions.push(emoji);
              
              // Increase count
              switch (emoji) {
                case '😂':
                  updatedPost.laugh_count += 1;
                  break;
                case '🔥':
                  updatedPost.fire_count += 1;
                  break;
                case '✅':
                  updatedPost.check_count += 1;
                  break;
              }
              console.log(`Added ${emoji} reaction. New counts:`, {
                laugh: updatedPost.laugh_count,
                fire: updatedPost.fire_count,
                check: updatedPost.check_count
              });
            }
            
            updatedPost.user_emoji_reactions = userReactions;
            return updatedPost;
          }
          return post;
        }));
      } else if (reactionType !== 'emoji') {
        // Handle old reaction types
        await postsAPI[reactionType](postId);
        // Update the post locally instead of refetching
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            const updatedPost = { ...post };
            switch (reactionType) {
              case 'like':
                updatedPost.is_liked = !updatedPost.is_liked;
                updatedPost.like_count += updatedPost.is_liked ? 1 : -1;
                break;
              case 'hug':
                updatedPost.is_hugged = !updatedPost.is_hugged;
                updatedPost.hug_count += updatedPost.is_hugged ? 1 : -1;
                break;
              case 'relate':
                updatedPost.is_related = !updatedPost.is_related;
                updatedPost.relate_count += updatedPost.is_related ? 1 : -1;
                break;
            }
            return updatedPost;
          }
          return post;
        }));
      }
    } catch (err) {
      console.error(`Failed to ${reactionType} post:`, err);
    }
  }, []);

  const handlePostCreated = useCallback((newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const handlePostUpdated = useCallback((updatedPost: Post) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

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
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => {
              fetchedRef.current = false;
              fetchData();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
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
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
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