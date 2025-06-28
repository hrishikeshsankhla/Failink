import api from '../lib/axios'
import { requestCache } from '../utils/requestCache'

// Types
export interface User {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  profile_picture?: string
  bio?: string
  created_at: string
}

export interface PostMedia {
  id: number;
  file: string;
  uploaded_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  created_at: string;
  like_count: number;
  hug_count: number;
  relate_count: number;
  is_liked: boolean;
  is_hugged: boolean;
  is_related: boolean;
  emoji_reactions: { [key: string]: number };
  user_emoji_reactions: string[];
  laugh_count: number;
  fire_count: number;
  check_count: number;
  media: PostMedia[];
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

export interface UserStats {
  posts_count: number
  likes_received: number
  hugs_received: number
  relates_received: number
  emoji_reactions_received: number
  likes_given: number
  hugs_given: number
  relates_given: number
  emoji_reactions_given: number
  total_reactions_received: number
  total_reactions_given: number
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
  
  getProfile: () => requestCache.get('user-profile', () => 
    api.get<User>('/users/profile/').then(res => res.data)
  ),
}

// Posts API
export const postsAPI = {
  getAll: () => requestCache.get('posts-all', () => 
    api.get<Post[]>('/posts/').then(res => res.data)
  ),
  
  getById: (id: string) => requestCache.get(`post-${id}`, () => 
    api.get<Post>(`/posts/${id}/`).then(res => res.data)
  ),
  
  create: (data: { title: string; content: string; tag_names: string[]; media?: File[] | FileList }) => {
    requestCache.delete('posts-all')
    // If media is present, use FormData
    if (data.media && data.media.length > 0) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      data.tag_names.forEach(tag => formData.append('tag_names', tag));
      Array.from(data.media).forEach(file => formData.append('media', file));
      return api.post<Post>('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post<Post>('/posts/', data);
  },
  
  update: (id: string, data: { title: string; content: string; tag_names: string[]; media?: File[] | FileList }) => {
    requestCache.delete('posts-all')
    requestCache.delete(`post-${id}`)
    if (data.media && data.media.length > 0) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      data.tag_names.forEach(tag => formData.append('tag_names', tag));
      Array.from(data.media).forEach(file => formData.append('media', file));
      return api.patch<Post>(`/posts/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch<Post>(`/posts/${id}/`, data);
  },
  
  delete: (id: string) => {
    // Invalidate caches when deleting post
    requestCache.delete('posts-all')
    requestCache.delete(`post-${id}`)
    return api.delete(`/posts/${id}/`)
  },
  
  like: (id: string) => {
    // Invalidate specific post cache
    requestCache.delete(`post-${id}`)
    return api.post(`/posts/${id}/like/`)
  },
  
  hug: (id: string) => {
    // Invalidate specific post cache
    requestCache.delete(`post-${id}`)
    return api.post(`/posts/${id}/hug/`)
  },
  
  relate: (id: string) => {
    // Invalidate specific post cache
    requestCache.delete(`post-${id}`)
    return api.post(`/posts/${id}/relate/`)
  },
  
  emojiReact: (id: string, emoji: string) => {
    // Invalidate specific post cache
    requestCache.delete(`post-${id}`)
    return api.post(`/posts/${id}/emoji_react/`, { emoji })
  },
  
  getTrendingTags: () => requestCache.get('trending-tags', () => 
    api.get<Tag[]>('/posts/trending-tags/').then(res => res.data)
  ),
  
  getFeed: (params = {}) =>
    requestCache.get(
      'feed-home-' + JSON.stringify(params),
      () => api.get('/feed/', { params }).then(res => res.data),
    ),
}

// Comments API
export const commentsAPI = {
  getComments: (postId: string, page = 1) =>
    requestCache.get(`comments-${postId}-${page}`, () =>
      api.get(`/posts/${postId}/comments/?page=${page}`).then(res => res.data)
    ),
  
  // Batch load comments for multiple posts
  getBatchComments: (postIds: string[]) =>
    requestCache.get(`batch-comments-${postIds.sort().join('-')}`, () =>
      api.post('/posts/batch-comments/', { post_ids: postIds }).then(res => res.data)
    ),
  
  addComment: (postId: string, content: string, parentId?: string) => {
    const data: { content: string; parent?: string } = { content }
    if (parentId) data.parent = parentId
    
    // Invalidate cache for this post's comments
    requestCache.delete(`comments-${postId}-1`)
    
    return api.post(`/posts/${postId}/comments/`, data)
  },
  
  deleteComment: (postId: string, commentId: string) => {
    // Invalidate cache for this post's comments
    requestCache.delete(`comments-${postId}-1`)
    
    return api.delete(`/posts/${postId}/comments/${commentId}/`)
  },
}

// Users API
export const usersAPI = {
  getSuggested: () => requestCache.get('suggested-users', () =>
    api.get<User[]>('/users/suggested/').then(res => res.data)
  ),
  
  getProfile: () => requestCache.get('user-profile', () => 
    api.get<User>('/users/profile/').then(res => res.data)
  ),
  
  getUserProfile: (userId: string) => requestCache.get(`user-profile-${userId}`, () => 
    api.get<User>(`/users/${userId}/`).then(res => res.data)
  ),
  
  updateProfile: (data: Partial<User> | FormData) => {
    // Invalidate user profile cache when updating
    requestCache.delete('user-profile')
    
    // Check if data is FormData (for file uploads) or regular object
    if (data instanceof FormData) {
      return api.patch<{ user: User; message: string }>('/users/profile/update/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      return api.patch<{ user: User; message: string }>('/users/profile/update/', data)
    }
  },
  
  getUserPosts: (userId: string, page = 1) => requestCache.get(`user-posts-${userId}-${page}`, () =>
    api.get<{ results: Post[], count: number, next: string | null, previous: string | null }>(
      `/users/${userId}/posts/?page=${page}`
    ).then(res => res.data)
  ),
  
  getUserReactions: (userId: string, type = 'all', page = 1) => requestCache.get(`user-reactions-${userId}-${type}-${page}`, () =>
    api.get<{ results: Post[], count: number, next: string | null, previous: string | null }>(
      `/users/${userId}/reactions/?type=${type}&page=${page}`
    ).then(res => res.data)
  ),
  
  getUserStats: (userId: string) => requestCache.get(`user-stats-${userId}`, () =>
    api.get<UserStats>(`/users/${userId}/stats/`).then(res => res.data)
  ),
}

export default api 