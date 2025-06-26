import api from '../lib/axios'

// Types
export interface User {
  id: string
  email: string
  username: string
  profile_picture?: string
  bio?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author: {
    username: string
    profile_picture?: string
  }
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
  created_at: string
  like_count: number
  hug_count: number
  relate_count: number
  is_liked: boolean
  is_hugged: boolean
  is_related: boolean
  emoji_reactions: { [key: string]: number }
  user_emoji_reactions: string[]
  laugh_count: number
  fire_count: number
  check_count: number
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface TagWithCount {
  tag: Tag
  post_count: number
}

// Auth API
export const authAPI = {
  login: (email: string, password: string, rememberMe: boolean) =>
    api.post('/users/login/', { email, password, remember_me: rememberMe }),
  
  register: (email: string, username: string, password: string, password2: string) =>
    api.post('/users/register/', { email, username, password, password2 }),
  
  googleLogin: (accessToken: string) =>
    api.post('/users/google/', { access_token: accessToken, provider: 'google' }),
  
  refreshToken: (refresh: string) =>
    api.post('/users/token/refresh/', { refresh }),
  
  forgotPassword: (email: string) =>
    api.post('/users/password-reset/', { email }),
  
  resetPassword: (token: string, password: string, password2: string) =>
    api.post('/users/password-reset/confirm/', { token, password, password2 }),
  
  getProfile: () => api.get<User>('/users/profile/'),
}

// Posts API
export const postsAPI = {
  getAll: () => api.get<Post[]>('/posts/'),
  
  getById: (id: string) => api.get<Post>(`/posts/${id}/`),
  
  create: (data: { title: string; content: string; tag_names: string[] }) =>
    api.post<Post>('/posts/', data),
  
  like: (id: string) => api.post(`/posts/${id}/like/`),
  
  hug: (id: string) => api.post(`/posts/${id}/hug/`),
  
  relate: (id: string) => api.post(`/posts/${id}/relate/`),
  
  emojiReact: (id: string, emoji: string) =>
    api.post(`/posts/${id}/emoji_react/`, { emoji }),
  
  getTrendingTags: () => api.get<Tag[]>('/posts/trending-tags/'),
}

// Comments API
export const commentsAPI = {
  getComments: (postId: string, page = 1) =>
    api.get(`/posts/${postId}/comments/?page=${page}`),
  
  addComment: (postId: string, content: string, parentId?: string) => {
    const data: { content: string; parent?: string } = { content }
    if (parentId) data.parent = parentId
    return api.post(`/posts/${postId}/comments/`, data)
  },
  
  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/posts/${postId}/comments/${commentId}/`),
}

// Users API
export const usersAPI = {
  getSuggested: () => api.get<User[]>('/users/suggested/'),
}

export default api 