import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersAPI, type User } from '../../api';

const SuggestedUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await usersAPI.getSuggested();
        // Ensure we're setting an array
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch suggested users:', error);
        setError('Failed to load suggested users');
        // Initialize with empty array in case of error
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Suggested Failfluencers</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Suggested Failfluencers</h2>
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Suggested Failfluencers</h2>
      {users && users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user.profile_picture || '/default-avatar.png'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.bio}</p>
                </div>
              </div>
              <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No suggested users available at the moment.
        </div>
      )}
    </div>
  );
};

export default SuggestedUsers; 