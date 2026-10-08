import api from "./api.index";
import type { CommentData, PaginatedCommentsResponse, PaginatedRepliesResponse } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface ToggleLikeResponse {
  status: "liked" | "unliked";
}

export const InteractionsAPI = {
  // Post Interactions
  toggleLike: async (postId: string): Promise<ToggleLikeResponse> => {
    const response = await api.post<BackendResponse<ToggleLikeResponse>>(`/posts/${postId}/like`);
    return response.data.data;
  },

  sharePost: async (postId: string, platform?: string): Promise<void> => {
    await api.post<BackendResponse<null>>(`/posts/${postId}/share`, { platform });
  },

  // 💬 Comment Engine API
  getTopLevelComments: async (postId: string, cursor?: string): Promise<PaginatedCommentsResponse> => {
    const query = cursor ? `?cursor=${cursor}` : "";
    const response = await api.get<BackendResponse<PaginatedCommentsResponse>>(`/interactions/comments/${postId}${query}`);
    return response.data.data;
  },

  getCommentReplies: async (commentId: string, cursor?: string): Promise<PaginatedRepliesResponse> => {
    const query = cursor ? `?cursor=${cursor}` : "";
    const response = await api.get<BackendResponse<PaginatedRepliesResponse>>(`/interactions/comments/${commentId}/replies${query}`);
    return response.data.data;
  },

  addComment: async (postId: string, content: string, parentId?: string): Promise<CommentData> => {
    const response = await api.post<BackendResponse<CommentData>>(`/interactions/comments/${postId}`, { 
      content, 
      parentCommentId: parentId || null 
    });
    return response.data.data;
  },

  toggleCommentLike: async (commentId: string): Promise<ToggleLikeResponse> => {
    const response = await api.post<BackendResponse<ToggleLikeResponse>>(`/interactions/comments/${commentId}/like`);
    return response.data.data;
  },

  updateComment: async (commentId: string, content: string): Promise<CommentData> => {
    const response = await api.put<BackendResponse<CommentData>>(`/interactions/comments/${commentId}`, { content });
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/interactions/comments/${commentId}`);
  },
};