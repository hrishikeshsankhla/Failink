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
  updateUser: (user: User) => void
}

// Track initialization to prevent multiple simultaneous calls
let isInitializing = false
let initPromise: Promise<void> | null = null

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
        // If already initializing, return the existing promise
        if (isInitializing && initPromise) {
          return initPromise
        }

        // If already initialized and authenticated, don't re-initialize
        const currentState = get()
        if (currentState.isAuthenticated && currentState.user && !currentState.isLoading) {
          return
        }

        isInitializing = true
        initPromise = (async () => {
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
                user: userResponse,
                isLoading: false,
              })
            } catch (error) {
              console.error('Token validation failed:', error)
              // Token is invalid, clear everything
              get().logout()
            }
          } else {
            // No tokens found, ensure clean state
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        })()

        try {
          await initPromise
        } finally {
          isInitializing = false
          initPromise = null
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
        } catch (error: unknown) {
          console.error('Login error:', error)
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Login failed. Please check your credentials.'
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
        } catch (error: unknown) {
          console.error('Registration error:', error)
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Registration failed. Please try again.'
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
        } catch (error: unknown) {
          console.error('Google login error:', error)
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Google login failed. Please try again.'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: () => {
        // Clear all storage
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
          isLoading: false,
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

      updateUser: (user: User) => set({ user }),
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