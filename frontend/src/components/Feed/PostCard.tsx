import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import EmojiReactions from './EmojiReactions';
import Comments from './Comments';
import api from '../../lib/axios';

interface Author {
  username: string;
  profile_picture?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  tags: Tag[];
  like_count: number;
  hug_count: number;
  relate_count: number;
  is_liked: boolean;
  is_hugged: boolean;
  is_related: boolean;
  emoji_reactions: { [key: string]: number };
  user_emoji_reactions: string[];
  created_at: string;
  laugh_count: number;
  fire_count: number;
  check_count: number;
}

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionType: 'like' | 'hug' | 'relate') => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReaction }) => {
  const {
    title,
    content,
    author,
    tags,
    user_emoji_reactions,
    created_at,
    laugh_count,
    fire_count,
    check_count
  } = post;

  const handleEmojiReaction = async (emoji: string) => {
    try {
      await api.post(`/posts/${post.id}/emoji_react/`, { emoji });
      // The parent component should refresh the post data after this
      onReaction(post.id, 'like'); // Reuse existing onReaction to trigger refresh
    } catch (error) {
      console.error('Failed to add emoji reaction:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow p-7 mb-8 border border-gray-100"
    >
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <img
          src={author.profile_picture || '/default-avatar.png'}
          alt={author.username}
          className="w-10 h-10 rounded-full mr-3 border border-gray-200"
        />
        <div>
          <h3 className="font-semibold text-base">{author.username}</h3>
          <p className="text-gray-400 text-xs">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-gray-700 mb-4 whitespace-pre-wrap text-sm">{content}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <span
            key={tag.id}
            className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100"
          >
            #{tag.name}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Emoji Reactions */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <EmojiReactions
          laugh_count={laugh_count}
          fire_count={fire_count}
          check_count={check_count}
          userReactions={user_emoji_reactions}
          onReaction={handleEmojiReaction}
        />
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Comments postId={post.id} />
      </div>
    </motion.div>
  );
};

export default PostCard; 