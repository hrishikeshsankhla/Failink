import { commentsAPI } from './index'

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

export async function getComments(postId: string, page = 1): Promise<CommentListResponse> {
  return await commentsAPI.getComments(postId, page);
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const res = await commentsAPI.addComment(postId, content, parentId);
  return res.data;
}

export async function deleteComment(postId: string, commentId: string) {
  await commentsAPI.deleteComment(postId, commentId);
} 