import type { Post as SharedPost } from "@/types/api.types";

/**
 * Reuse the application's existing Post contract so the feed,
 * detail page, and existing components remain type-compatible.
 */
export type Post = SharedPost;

export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived"
  | "trash";

export type PostReactionType =
  | "like"
  | "love"
  | "laugh"
  | "celebrate"
  | "support"
  | "sad"
  | "angry";

export interface PostPagination {
  limit: number;
  nextCursor: string | null;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: PostPagination;
}

export interface GetPostsParams {
  cursor?: string;
  limit?: number;
  authorId?: string;
}

export interface SharePostResponse {
  url: string;
  platform: string;
}

export interface DeletePostResponse {
  success: boolean;
}
