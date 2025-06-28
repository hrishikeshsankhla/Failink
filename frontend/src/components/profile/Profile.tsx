import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { usersAPI, type User, type UserStats, type Post } from '../../api'
import { Button } from '../ui/Button'
import PostCard from '../Feed/PostCard'
import { EditProfile } from './EditProfile'
import { getMediaUrl } from '../../utils/getMediaUrl'

type TabType = 'posts' | 'reactions' | 'stats'

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser, logout } = useAuthStore()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userReactions, setUserReactions] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postsPage, setPostsPage] = useState(1)
  const [reactionsPage, setReactionsPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [hasMoreReactions, setHasMoreReactions] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Determine which user's profile to show
  const targetUserId = userId || currentUser?.id
  const isOwnProfile = !userId || userId === currentUser?.id
  const displayUser = isOwnProfile ? currentUser : profileUser

  const fetchProfileUser = useCallback(async () => {
    if (!userId || isOwnProfile) return
    
    try {
      // Fetch the specific user's profile
      const user = await usersAPI.getUserProfile(userId)
      setProfileUser(user)
    } catch (err) {
      console.error('Failed to fetch profile user:', err)
      setError('Failed to load user profile')
    }
  }, [userId, isOwnProfile])

  const fetchUserStats = useCallback(async () => {
    if (!targetUserId) return
    
    try {
      const stats = await usersAPI.getUserStats(targetUserId)
      setUserStats(stats)
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
      setError('Failed to load user statistics')
    }
  }, [targetUserId])

  const fetchUserPosts = useCallback(async (page = 1, append = false) => {
    if (!targetUserId) return
    
    try {
      setLoading(true)
      const response = await usersAPI.getUserPosts(targetUserId, page)
      const newPosts = response.results
      
      if (append) {
        setUserPosts(prev => [...prev, ...newPosts])
      } else {
        setUserPosts(newPosts)
      }
      
      setHasMorePosts(!!response.next)
      setPostsPage(page)
    } catch (err) {
      console.error('Failed to fetch user posts:', err)
      setError('Failed to load user posts')
    } finally {
      setLoading(false)
    }
  }, [targetUserId])

  const fetchUserReactions = useCallback(async (page = 1, append = false) => {
    if (!targetUserId) return
    
    try {
      setLoading(true)
      const response = await usersAPI.getUserReactions(targetUserId, 'all', page)
      const newReactions = response.results
      
      if (append) {
        setUserReactions(prev => [...prev, ...newReactions])
      } else {
        setUserReactions(newReactions)
      }
      
      setHasMoreReactions(!!response.next)
      setReactionsPage(page)
    } catch (err) {
      console.error('Failed to fetch user reactions:', err)
      setError('Failed to load user reactions')
    } finally {
      setLoading(false)
    }
  }, [targetUserId])

  const handleProfileUpdated = useCallback(() => {
    // Update the current user in the store (this will be handled by the EditProfile component)
    // We just need to close the modal and refresh the profile data
    setIsEditModalOpen(false)
    
    // Force a re-render by updating the displayUser
    // Since currentUser is updated in the store, we need to trigger a re-render
    if (isOwnProfile) {
      // For own profile, the currentUser from the store should be updated
      // We can force a re-render by updating a state variable
      setProfileUser(null) // This will trigger a re-render
      fetchUserStats()
    }
  }, [isOwnProfile, fetchUserStats])

  const handleReaction = useCallback(async (postId: string, reactionType: 'like' | 'hug' | 'relate' | 'emoji', emoji?: string) => {
    // This would need to be implemented with the postsAPI
    console.log('Reaction handled:', { postId, reactionType, emoji })
  }, [])

  const handlePostUpdated = useCallback((updatedPost: Post) => {
    // Update the post in the user posts list
    setUserPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    // Remove the post from the user posts list
    setUserPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  const loadMorePosts = () => {
    if (hasMorePosts && !loading) {
      fetchUserPosts(postsPage + 1, true)
    }
  }

  const loadMoreReactions = () => {
    if (hasMoreReactions && !loading) {
      fetchUserReactions(reactionsPage + 1, true)
    }
  }

  useEffect(() => {
    fetchProfileUser()
  }, [fetchProfileUser])

  useEffect(() => {
    fetchUserStats()
  }, [fetchUserStats])

  // Refresh profile data when currentUser changes (e.g., after profile update)
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      // Force a re-render by updating profileUser to null
      setProfileUser(null)
    }
  }, [currentUser, isOwnProfile])

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchUserPosts(1, false)
    } else if (activeTab === 'reactions') {
      fetchUserReactions(1, false)
    }
  }, [activeTab, fetchUserPosts, fetchUserReactions])

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: '📊' },
    { id: 'posts', label: isOwnProfile ? 'My Posts' : 'Posts', icon: '📝' },
    { id: 'reactions', label: isOwnProfile ? 'Reacted Posts' : 'Reactions', icon: '❤️' },
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in to view profiles</h2>
        </div>
      </div>
    )
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Loading profile...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg mb-8"
        >
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <img
                key={displayUser.profile_picture || 'default'}
                className="h-24 w-24 rounded-full border-4 border-blue-100"
                src={getMediaUrl(displayUser.profile_picture)}
                alt={displayUser.username}
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{displayUser.username}</h1>
                {(displayUser.first_name || displayUser.last_name) && (
                  <p className="text-lg text-gray-600">
                    {[displayUser.first_name, displayUser.last_name].filter(Boolean).join(' ')}
                  </p>
                )}
                <p className="text-lg text-gray-600">{displayUser.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {new Date(displayUser.created_at).toLocaleDateString()}
                </p>
                {displayUser.bio && (
                  <p className="text-gray-700 mt-2">{displayUser.bio}</p>
                )}
              </div>
              <div className="flex space-x-3">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="danger"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    Back to My Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'stats' && userStats && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isOwnProfile ? 'Your Statistics' : `${displayUser.username}'s Statistics`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{userStats.posts_count}</div>
                  <div className="text-sm text-blue-700">Posts Created</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{userStats.total_reactions_received}</div>
                  <div className="text-sm text-green-700">Reactions Received</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{userStats.total_reactions_given}</div>
                  <div className="text-sm text-purple-700">Reactions Given</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {userStats.posts_count > 0 ? Math.round(userStats.total_reactions_received / userStats.posts_count) : 0}
                  </div>
                  <div className="text-sm text-orange-700">Avg Reactions/Post</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reactions Received</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">👍 Likes</span>
                      <span className="font-medium">{userStats.likes_received}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🤗 Hugs</span>
                      <span className="font-medium">{userStats.hugs_received}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💭 Relates</span>
                      <span className="font-medium">{userStats.relates_received}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">😄 Emoji Reactions</span>
                      <span className="font-medium">{userStats.emoji_reactions_received}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reactions Given</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">👍 Likes</span>
                      <span className="font-medium">{userStats.likes_given}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🤗 Hugs</span>
                      <span className="font-medium">{userStats.hugs_given}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💭 Relates</span>
                      <span className="font-medium">{userStats.relates_given}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">😄 Emoji Reactions</span>
                      <span className="font-medium">{userStats.emoji_reactions_given}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {isOwnProfile ? 'My Posts' : `${displayUser.username}'s Posts`}
                </h2>
                {userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReaction={handleReaction}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                      />
                    ))}
                    {hasMorePosts && (
                      <div className="text-center pt-4">
                        <Button
                          onClick={loadMorePosts}
                          disabled={loading}
                          variant="outline"
                        >
                          {loading ? 'Loading...' : 'Load More Posts'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {isOwnProfile ? 'No posts yet' : 'No posts yet'}
                    </h3>
                    <p className="text-gray-600">
                      {isOwnProfile 
                        ? 'Start sharing your failure stories to see them here!' 
                        : `${displayUser.username} hasn't shared any posts yet.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reactions' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {isOwnProfile ? 'Posts You\'ve Reacted To' : `Posts ${displayUser.username} Has Reacted To`}
                </h2>
                {userReactions.length > 0 ? (
                  <div className="space-y-6">
                    {userReactions.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReaction={handleReaction}
                      />
                    ))}
                    {hasMoreReactions && (
                      <div className="text-center pt-4">
                        <Button
                          onClick={loadMoreReactions}
                          disabled={loading}
                          variant="outline"
                        >
                          {loading ? 'Loading...' : 'Load More Reactions'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {isOwnProfile ? 'No reactions yet' : 'No reactions yet'}
                    </h3>
                    <p className="text-gray-600">
                      {isOwnProfile 
                        ? 'Start reacting to posts to see them here!' 
                        : `${displayUser.username} hasn't reacted to any posts yet.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Edit Profile Modal */}
        <EditProfile
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </div>
  )
} 