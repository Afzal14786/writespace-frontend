import api from "./api.index";
import type { Post } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: {
    limit: number;
    nextCursor: string | null;
  };
}

export interface GetPostsParams {
  cursor?: string;
  limit?: number;
  authorId?: string;
}

export const PostsAPI = {
  getPosts: async (params?: GetPostsParams): Promise<PaginatedPosts> => {
    const query = new URLSearchParams();
    
    if (params?.cursor) query.append("cursor", params.cursor);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.authorId) query.append("authorId", params.authorId);

    const url = `/posts?${query.toString()}`;
    const response = await api.get(url);
    
    return response.data.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<BackendResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  createPost: async (formData: FormData): Promise<Post> => {
    const response = await api.post<BackendResponse<Post>>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  likePost: async (id: string): Promise<{ status: string; likesCount: number }> => {
    const response = await api.post<BackendResponse<{ status: string; likesCount: number }>>(`/posts/${id}/like`);
    return response.data.data;
  },

  updatePost: async (postId: string, formData: FormData): Promise<Post> => {
    const response = await api.put<BackendResponse<Post>>(`/posts/${postId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/posts/${postId}`);
  }
};