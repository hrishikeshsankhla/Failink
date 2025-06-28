import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { postsAPI, type Post } from '../../api';
import { useAuthStore } from '../../store/authStore';

interface PostData {
  title: string;
  content: string;
  tags: string;
  media: File[];
}

interface CreatePostProps {
  onPostCreated?: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<PostData>({
    title: '',
    content: '',
    tags: '',
    media: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    // Only allow up to 10 files
    if (files.length + mediaFiles.length > 10) {
      setError('You can upload up to 10 media files.');
      return;
    }
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError('Only images (jpg, png, gif) and videos (mp4, webm, ogg) are allowed.');
        return;
      }
    }
    setMediaFiles(prev => [...prev, ...files]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      setError('You must be logged in to create a post');
      setLoading(false);
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      const response = await postsAPI.create({
        title: formData.title,
        content: formData.content,
        tag_names: tagsArray,
        media: mediaFiles,
      });
      setFormData({
        title: '',
        content: '',
        tags: '',
        media: [],
      });
      setMediaFiles([]);
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err: unknown) {
      console.error('Error creating post:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create post';
      setError(errorMessage);
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

        {/* Media Upload */}
        <div>
          <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-1">
            Media (up to 10 images/videos)
          </label>
          <input
            type="file"
            id="media"
            name="media"
            accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
            multiple
            onChange={handleMediaChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Previews */}
          {mediaFiles.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-2">
              {mediaFiles.map((file, idx) => (
                <div key={idx} className="relative w-24 h-24 flex flex-col items-center justify-center border rounded overflow-hidden bg-gray-50">
                  {file.type.startsWith('image') ? (
                    <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                  ) : (
                    <video src={URL.createObjectURL(file)} controls className="object-cover w-full h-full" />
                  )}
                  <button type="button" onClick={() => handleRemoveMedia(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                </div>
              ))}
            </div>
          )}
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