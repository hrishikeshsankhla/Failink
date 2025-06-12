import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Author {
  username: string;
  profile_picture?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Post {
  id: number;
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
  created_at: string;
}

interface PostCardProps {
  post: Post;
  onReaction: (postId: number, reactionType: 'like' | 'hug' | 'relate') => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReaction }) => {
  const {
    title,
    content,
    author,
    tags,
    like_count,
    hug_count,
    relate_count,
    is_liked,
    is_hugged,
    is_related,
    created_at
  } = post;

  const reactionButtons = [
    {
      type: 'like' as const,
      icon: '❤️',
      count: like_count,
      isActive: is_liked
    },
    {
      type: 'hug' as const,
      icon: '🤗',
      count: hug_count,
      isActive: is_hugged
    },
    {
      type: 'relate' as const,
      icon: '😅',
      count: relate_count,
      isActive: is_related
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <img
          src={author.profile_picture || '/default-avatar.png'}
          alt={author.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold">{author.username}</h3>
          <p className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{content}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <span
            key={tag.id}
            className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
          >
            #{tag.name}
          </span>
        ))}
      </div>

      {/* Reaction Buttons */}
      <div className="flex gap-4 border-t pt-4">
        {reactionButtons.map(({ type, icon, count, isActive }) => (
          <button
            key={type}
            onClick={() => onReaction(post.id, type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span>{icon}</span>
            <span>{count}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default PostCard; 