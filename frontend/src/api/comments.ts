import api from '../lib/axios';

export interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    profile_picture?: string;
  };
  content: string;
  parent: string | null;
  created_at: string;
  updated_at: string;
  replies: Comment[];
}

export interface CommentListResponse {
  results: Comment[];
  count: number;
  next: string | null;
  previous: string | null;
}

export async function getComments(postId: string, page = 1) {
  const res = await api.get<CommentListResponse>(`/posts/${postId}/comments/?page=${page}`);
  return res.data;
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const data: any = { content };
  if (parentId) data.parent = parentId;
  const res = await api.post<Comment>(`/posts/${postId}/comments/`, data);
  return res.data;
}

export async function deleteComment(postId: string, commentId: string) {
  await api.delete(`/posts/${postId}/comments/${commentId}/`);
} 