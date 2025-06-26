import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, type User } from '../api'

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
          const response = await authAPI.login(email, password, rememberMe)
          const { access, refresh } = response.data
          
          // Get user profile after successful login
          const userResponse = await authAPI.getProfile()
          
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
            error: error.response?.data?.detail || error.response?.data?.error || 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (email: string, username: string, password: string, password2: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.register(email, username, password, password2)
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
            error: error.response?.data?.detail || error.response?.data?.error || 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      googleLogin: async (accessToken: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.googleLogin(accessToken)
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
          const response = await authAPI.refreshToken(refreshToken)
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