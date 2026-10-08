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
    const response = await api.get<BackendResponse<PaginatedPosts>>(
      "/posts",
      {
        params: {
          cursor: params?.cursor,
          limit: params?.limit,
          authorId: params?.authorId,
        },
      }
    );

    return response.data.data;
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await api.get<BackendResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  createPost: async (formData: FormData): Promise<Post> => {
    const response = await api.post<BackendResponse<Post>>(
      "/posts/create",
      formData
    );

    return response.data.data;
  },

  likePost: async (
    id: string
  ): Promise<{ status: "liked" | "unliked" }> => {
    const response = await api.post<
      BackendResponse<{ status: "liked" | "unliked" }>
    >(`/posts/${id}/like`);

    return response.data.data;
  },

  updatePost: async (postId: string, formData: FormData): Promise<Post> => {
    const response = await api.put<BackendResponse<Post>>(
      `/posts/${postId}`,
      formData
    );

    return response.data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/posts/${postId}`);
  }
};