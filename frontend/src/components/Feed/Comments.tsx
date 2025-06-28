import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getComments, addComment, type Comment } from '../../api/comments';
import { useAuthStore } from '../../store/authStore';
import ProfileLink from '../ui/ProfileLink';

interface CommentsProps {
  postId: string;
}

// Cache for comments to prevent duplicate requests
const commentsCache = new Map<string, { data: Comment[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchComments = useCallback(async () => {
    // Check cache first
    const cached = commentsCache.get(postId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setComments(cached.data);
      return;
    }

    try {
      const response = await getComments(postId);
      const commentsData = response.results;
      setComments(commentsData);
      
      // Cache the result
      commentsCache.set(postId, {
        data: commentsData,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments');
    }
  }, [postId]);

  useEffect(() => {
    // Only fetch comments when expanded
    if (isExpanded) {
      fetchComments();
    }
  }, [fetchComments, isExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comment = await addComment(postId, newComment, replyingTo || undefined);
      if (replyingTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo) {
            return { ...c, replies: [...(c.replies || []), comment] };
          }
          return c;
        }));
      } else {
        setComments(prev => [comment, ...prev]);
      }
      
      // Update cache
      const updatedComments = replyingTo 
        ? comments.map(c => c.id === replyingTo ? { ...c, replies: [...(c.replies || []), comment] } : c)
        : [comment, ...comments];
      
      commentsCache.set(postId, {
        data: updatedComments,
        timestamp: Date.now()
      });
      
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false, level = 0) => (
    <div
      key={comment.id}
      className={`mb-3 ${isReply ? `ml-${Math.min(8 + level * 4, 24)}` : ''}`}
    >
      <div className={`flex items-start space-x-3 ${isReply ? 'bg-gray-50 rounded-lg p-2 border-l-4 border-blue-100' : ''}`}>
        <ProfileLink user={comment.user} pictureSize="sm" showUsername={false} />
        <div className="flex-1">
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <ProfileLink user={comment.user} showPicture={false} className="text-xs" />
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-gray-700 text-xs mt-1">{comment.content}</p>
            {isAuthenticated && !isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-blue-500 hover:text-blue-600 mt-2"
              >
                Reply
              </button>
            )}
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2 border-l border-gray-100 pl-2">
              {comment.replies.map(reply => renderComment(reply, true, level + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Comments</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {isExpanded ? 'Hide' : 'Show'} Comments
        </button>
      </div>
      
      {isExpanded && (
        <>
          {isAuthenticated && (
            <form onSubmit={handleSubmit} className="mb-4">
              {replyingTo && (
                <div className="mb-2 text-xs text-gray-600">
                  Replying to a comment
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-blue-500 hover:text-blue-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent text-xs"
                rows={2}
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-xs"
              >
                {loading ? 'Posting...' : replyingTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </form>
          )}
          {error && (
            <div className="text-red-500 text-xs mb-2">{error}</div>
          )}
          <div className="space-y-2">
            {comments.length > 0 ? (
              comments.map(comment => renderComment(comment))
            ) : (
              <p className="text-gray-400 text-center py-2 text-xs">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Comments; 