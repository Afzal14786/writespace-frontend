import { useCallback, useEffect, useRef, useState } from "react";

import { PostsAPI } from "@/features/posts/api/posts.api";
import type { Post } from "@/features/posts/types/post.types";

const PAGE_SIZE = 20;

interface UsePostsFeedOptions {
  authorId?: string;
}

interface UsePostsFeedResult {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load posts. Please try again.";
}

export function usePostsFeed(
  options: UsePostsFeedOptions = {},
): UsePostsFeedResult {
  const { authorId } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const mountedRef = useRef(false);
  const requestInProgressRef = useRef(false);
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const requestVersionRef = useRef(0);

  const fetchPage = useCallback(
    async (reset: boolean): Promise<void> => {
      if (requestInProgressRef.current && !reset) {
        return;
      }

      if (!reset && !hasMoreRef.current) {
        return;
      }

      requestInProgressRef.current = true;

      const requestVersion = ++requestVersionRef.current;
      const cursor = reset ? undefined : cursorRef.current;

      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
        setError(null);
      }

      try {
        const result = await PostsAPI.getPosts({
          limit: PAGE_SIZE,
          ...(cursor ? { cursor } : {}),
          ...(authorId ? { authorId } : {}),
        });

        if (
          !mountedRef.current ||
          requestVersion !== requestVersionRef.current
        ) {
          return;
        }

        const newCursor = result.pagination.nextCursor;
        const newHasMore = Boolean(newCursor);

        setPosts((currentPosts) => {
          if (reset) {
            return result.posts;
          }

          const existingIds = new Set(currentPosts.map((post) => post.id));

          const uniqueNewPosts = result.posts.filter(
            (post) => !existingIds.has(post.id),
          );

          return [...currentPosts, ...uniqueNewPosts];
        });

        cursorRef.current = newCursor;
        hasMoreRef.current = newHasMore;

        setNextCursor(newCursor);
        setHasMore(newHasMore);
      } catch (fetchError: unknown) {
        if (
          mountedRef.current &&
          requestVersion === requestVersionRef.current
        ) {
          setError(getErrorMessage(fetchError));
        }
      } finally {
        if (
          mountedRef.current &&
          requestVersion === requestVersionRef.current
        ) {
          requestInProgressRef.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [authorId],
  );

  useEffect(() => {
    mountedRef.current = true;
    void fetchPage(true);

    return () => {
      mountedRef.current = false;
      requestVersionRef.current += 1;
      requestInProgressRef.current = false;
    };
  }, [fetchPage]);

  const refresh = useCallback(async (): Promise<void> => {
    cursorRef.current = null;
    hasMoreRef.current = true;

    setNextCursor(null);
    setHasMore(true);

    await fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!nextCursor || !hasMore) {
      return;
    }

    await fetchPage(false);
  }, [fetchPage, hasMore, nextCursor]);

  const addPost = useCallback((post: Post): void => {
    // The feed endpoint returns published posts only.
    // Drafts and scheduled posts should not appear in the public feed.
    if (post.status !== "published") {
      return;
    }

    setPosts((currentPosts) => [
      post,
      ...currentPosts.filter((existingPost) => existingPost.id !== post.id),
    ]);
  }, []);

  const removePost = useCallback((postId: string): void => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId),
    );
  }, []);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    addPost,
    removePost,
  };
}
