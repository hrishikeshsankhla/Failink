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
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: async () => {
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
        
        if (accessToken && refreshToken) {
          set({ 
            accessToken, 
            refreshToken, 
            isAuthenticated: true,
            isLoading: true 
          })
          
          try {
            // Verify the token is still valid by getting user profile
            const userResponse = await authAPI.getProfile()
            set({
              user: userResponse.data,
              isLoading: false,
            })
          } catch (error) {
            // Token is invalid, clear everything
            get().logout()
          }
        }
      },

      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.login(email, password, rememberMe)
          const { access, refresh, user } = response.data
          
          // Store tokens based on remember me preference
          const storage = rememberMe ? localStorage : sessionStorage
          storage.setItem('accessToken', access)
          storage.setItem('refreshToken', refresh)
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          console.error('Login error:', error)
          const errorMessage = error.response?.data?.error || 
                              error.response?.data?.detail || 
                              error.message || 
                              'Login failed. Please check your credentials.'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
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
            error: null,
          })
        } catch (error: any) {
          console.error('Registration error:', error)
          const errorMessage = error.response?.data?.error || 
                              error.response?.data?.detail || 
                              error.message || 
                              'Registration failed. Please try again.'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
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
            error: null,
          })
        } catch (error: any) {
          console.error('Google login error:', error)
          const errorMessage = error.response?.data?.error || 
                              error.response?.data?.detail || 
                              error.message || 
                              'Google login failed. Please try again.'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
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
          error: null,
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
          console.error('Token refresh error:', error)
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