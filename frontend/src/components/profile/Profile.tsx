import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in to view your profile</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <img
                className="h-20 w-20 rounded-full"
                src={user.profile_picture || 'https://via.placeholder.com/150'}
                alt={user.username}
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.bio || 'No bio yet'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Profile Actions */}
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {/* TODO: Implement edit profile */}}
              >
                Edit Profile
              </Button>
              <Button
                variant="danger"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 