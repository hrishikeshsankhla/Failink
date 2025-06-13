import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get the access token from both storage locations
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    
    // Debug logging
    console.log('Request interceptor - Token:', {
      hasToken: !!accessToken,
      token: accessToken,
      tokenLength: accessToken?.length,
      storage: {
        localStorage: localStorage.getItem('accessToken'),
        sessionStorage: sessionStorage.getItem('accessToken')
      }
    })

    if (accessToken) {
      // Ensure the token is properly formatted
      const token = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`
      config.headers['Authorization'] = token
    }

    // Get the CSRF token from the cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1]

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }

    // Debug logging
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers['Authorization']?.substring(0, 20) + '...' // Log only part of the token for security
      },
      baseURL: config.baseURL
    })

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Debug logging
    console.log('Response interceptor - Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers['Authorization']?.substring(0, 20) + '...' // Log only part of the token for security
        },
        baseURL: error.config?.baseURL
      }
    })

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await instance.post('/users/token/refresh/', {
          refresh: refreshToken,
        })

        const { access } = response.data
        // Store in the same storage as the original token
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage
        storage.setItem('accessToken', access)

        // Update the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${access}`
        return instance(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear the tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default instance 