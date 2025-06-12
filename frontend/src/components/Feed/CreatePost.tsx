import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

interface PostData {
  title: string;
  content: string;
  tags: string;
}

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const [formData, setFormData] = useState<PostData>({
    title: '',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Debug logging
    console.log('Auth State:', {
      isAuthenticated,
      hasAccessToken: !!accessToken,
      accessToken,
      storage: {
        localStorage: localStorage.getItem('accessToken'),
        sessionStorage: sessionStorage.getItem('accessToken')
      }
    });

    if (!isAuthenticated || !accessToken) {
      setError('You must be logged in to create a post');
      setLoading(false);
      return;
    }

    try {
      // Convert comma-separated tags to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Debug logging
      console.log('Making request with headers:', {
        Authorization: `Bearer ${accessToken}`
      });

      const response = await api.post('/posts/', {
        title: formData.title,
        content: formData.content,
        tag_names: tagsArray
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        tags: ''
      });

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err: any) {
      console.error('Error creating post:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error config:', {
        url: err.config?.url,
        method: err.config?.method,
        headers: {
          ...err.config?.headers,
          Authorization: err.config?.headers['Authorization']?.substring(0, 20) + '...'
        }
      });
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-4">Share Your Failure Story</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What went wrong?"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Your Story
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share the details of your failure story..."
          />
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="interview, coding, startup, etc."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Posting...
            </div>
          ) : (
            'Share Your Story'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreatePost; 