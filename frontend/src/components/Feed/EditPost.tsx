import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { postsAPI, type Post } from '../../api';
import { Button } from '../ui/Button';

interface EditPostProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
  onError?: (error: string) => void;
}

export const EditPost: React.FC<EditPostProps> = ({ post, isOpen, onClose, onPostUpdated, onError }) => {
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    tags: post.tags.map(tag => tag.name).join(', ')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Update form data when post changes
  useEffect(() => {
    setFormData({
      title: post.title,
      content: post.content,
      tags: post.tags.map(tag => tag.name).join(', ')
    });
    setError(null);
  }, [post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmittingRef.current || loading) {
      console.log('Preventing duplicate submission');
      return;
    }
    
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting post update for:', post.id);
      console.log('Form data:', formData);
      
      // Convert comma-separated tags to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      console.log('Tags array:', tagsArray);

      const response = await postsAPI.update(post.id, {
        title: formData.title,
        content: formData.content,
        tag_names: tagsArray
      });

      console.log('Post update successful:', response.data);
      
      // Notify parent component
      onPostUpdated(response.data);
      
      // Close the modal
      onClose();
    } catch (err: unknown) {
      console.error('Error updating post:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as { response?: { data?: unknown } })?.response?.data,
        status: (err as { response?: { status?: number } })?.response?.status
      });
      
      // Handle different types of errors
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: unknown } };
        if (error.response?.status === 404) {
          const errorMessage = 'Post not found. It may have been deleted or moved.';
          console.log('Post not found - closing modal');
          setError(errorMessage);
          onError?.(errorMessage);
          // Close modal if post doesn't exist
          setTimeout(() => onClose(), 2000);
        } else if (error.response?.status === 403) {
          const errorMessage = 'You do not have permission to edit this post.';
          setError(errorMessage);
          onError?.(errorMessage);
        } else if (error.response?.status === 400) {
          // Handle validation errors
          const errorData = error.response.data;
          let errorMessage: string;
          if (typeof errorData === 'object' && errorData !== null) {
            const errorMessages = Object.values(errorData).flat();
            errorMessage = Array.isArray(errorMessages) ? errorMessages.join(', ') : 'Invalid data provided.';
          } else {
            errorMessage = 'Invalid data provided.';
          }
          setError(errorMessage);
          onError?.(errorMessage);
        } else if (error.response?.status && error.response.status >= 500) {
          const errorMessage = 'Server error. Please try again later.';
          setError(errorMessage);
          onError?.(errorMessage);
        } else {
          const errorMessage = 'Failed to update post. Please try again.';
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } else {
        const errorMessage = 'An unexpected error occurred. Please try again.';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      title: post.title,
      content: post.content,
      tags: post.tags.map(tag => tag.name).join(', ')
    });
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close edit post modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What went wrong?"
                  />
                </div>

                {/* Content Textarea */}
                <div>
                  <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Story
                  </label>
                  <textarea
                    id="edit-content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share the details of your failure story..."
                  />
                </div>

                {/* Tags Input */}
                <div>
                  <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="edit-tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="interview, coding, startup, etc."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Post'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 