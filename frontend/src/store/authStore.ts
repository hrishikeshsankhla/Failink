import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  email: string
  username: string
  profile_picture?: string
  bio?: string
  created_at: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  register: (email: string, username: string, password: string, password2: string) => Promise<void>
  googleLogin: (accessToken: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  clearError: () => void
}

const API_URL = 'http://localhost:8000/api'

// Create a separate axios instance for auth requests
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken'),
      isAuthenticated: !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')),
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAxios.post('/users/login/', { email, password, remember_me: rememberMe })
          const { access, refresh } = response.data
          
          // Get user profile after successful login
          const userResponse = await authAxios.get('/users/profile/', {
            headers: { Authorization: `Bearer ${access}` }
          })
          
          // Store tokens based on remember me preference
          const storage = rememberMe ? localStorage : sessionStorage
          storage.setItem('accessToken', access)
          storage.setItem('refreshToken', refresh)
          
          set({
            user: userResponse.data,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (email: string, username: string, password: string, password2: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAxios.post('/users/register/', {
            email,
            username,
            password,
            password2,
          })
          const { user, access, refresh } = response.data
          
          localStorage.setItem('accessToken', access)
          localStorage.setItem('refreshToken', refresh)
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      googleLogin: async (accessToken: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAxios.post('/users/google/', {
            access_token: accessToken,
            provider: 'google'
          })
          const { user, access, refresh } = response.data
          
          localStorage.setItem('accessToken', access)
          localStorage.setItem('refreshToken', refresh)
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || error.response?.data?.error || 'Google login failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await authAxios.post('/users/token/refresh/', {
            refresh: refreshToken,
          })
          const { access } = response.data
          
          // Store in the same storage as the original token
          const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage
          storage.setItem('accessToken', access)
          set({ accessToken: access })
        } catch (error) {
          get().logout()
          throw error
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 