import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import EmojiReactions from './EmojiReactions';
import Comments from './Comments';
import { EditPost } from './EditPost';
import { type Post } from '../../api';
import { useAuthStore } from '../../store/authStore';
import ProfileLink from '../ui/ProfileLink';
import { Button } from '../ui/Button';
import { postsAPI } from '../../api';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionType: 'like' | 'hug' | 'relate' | 'emoji', emoji?: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReaction, onPostUpdated, onPostDeleted }) => {
  const { user: currentUser } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
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

  const isOwnPost = currentUser?.id === author.id;

  const MAX_CONTENT_LENGTH = 200;
  const isLongContent = content.length > MAX_CONTENT_LENGTH;
  const displayedContent = showFullContent ? content : content.slice(0, MAX_CONTENT_LENGTH);

  // Unified media array (images and videos in upload order)
  const mediaList = post.media || [];

  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  const goToSlide = (idx: number) => setCarouselIndex(idx);

  const handleEmojiReaction = async (emoji: string) => {
    try {
      console.log(`PostCard: Emoji reaction clicked: ${emoji} for post ${post.id}`);
      await onReaction(post.id, 'emoji', emoji);
    } catch (error) {
      console.error('Failed to add emoji reaction:', error);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await postsAPI.delete(post.id);
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    onPostUpdated?.(updatedPost);
  };

  const handlePostUpdateError = (error: string) => {
    // If the post was not found (404), it might have been deleted
    if (error.includes('not found') || error.includes('deleted')) {
      onPostDeleted?.(post.id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow p-7 mb-8 border border-gray-100"
      >
        {/* Author Info */}
        <div className="flex items-center mb-4">
          <ProfileLink user={author} pictureSize="md" className="mr-3" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </div>
          </div>
          {isOwnPost && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isDeleting}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap text-sm">
          {displayedContent}
          {isLongContent && !showFullContent && (
            <>
              ...{' '}
              <button
                className="text-blue-500 hover:underline text-xs ml-1"
                onClick={() => setShowFullContent(true)}
              >
                Read More
              </button>
            </>
          )}
        </p>

        {/* Media Section */}
        {mediaList.length > 0 && (
          <div className="relative w-full flex flex-col items-center mb-4">
            <div className="w-full flex justify-center">
              {/\.(jpg|jpeg|png|gif)$/i.test(mediaList[carouselIndex].file) ? (
                <img
                  src={mediaList[carouselIndex].file}
                  alt={`media-${carouselIndex}`}
                  className="rounded-lg max-h-72 object-contain w-full"
                />
              ) :
              /\.(mp4|webm|ogg)$/i.test(mediaList[carouselIndex].file) ? (
                <video
                  src={mediaList[carouselIndex].file}
                  controls
                  className="rounded-lg max-h-72 object-contain w-full"
                />
              ) : null}
            </div>
            {mediaList.length > 1 && (
              <>
                {/* Carousel Arrows */}
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-opacity-100"
                  onClick={handlePrev}
                  aria-label="Previous media"
                >
                  &#8592;
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow hover:bg-opacity-100"
                  onClick={handleNext}
                  aria-label="Next media"
                >
                  &#8594;
                </button>
                {/* Dots */}
                <div className="flex justify-center mt-2 gap-2">
                  {mediaList.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full ${carouselIndex === idx ? 'bg-blue-500' : 'bg-gray-300'}`}
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to media ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
      
      {/* Edit Post Modal */}
      <EditPost
        post={post}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPostUpdated={handlePostUpdated}
        onError={handlePostUpdateError}
      />
    </>
  );
};

export default PostCard; 