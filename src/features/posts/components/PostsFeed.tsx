import { useCallback, useEffect, useRef } from "react";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import { usePostsFeed } from "@/features/posts/hooks/usePostsFeed";
import PostCard from "@/features/posts/components/PostCard";
import type { Post } from "@/features/posts/types/post.types";

interface PostsFeedProps {
  currentUserId?: string;
  onEditPost?: (post: Post) => void;
  refreshKey?: number;
  emptyMessage?: string;
}

export default function PostsFeed({
  currentUserId,
  onEditPost,
  refreshKey = 0,
  emptyMessage = "No posts yet. Check back later!",
}: PostsFeedProps) {
  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    removePost,
  } = usePostsFeed();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (refreshKey > 0) {
      void refresh();
    }
  }, [refreshKey, refresh]);

  const handlePostDeleted = useCallback(
    (postId: string) => {
      removePost(postId);
    },
    [removePost],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || isLoading || isLoadingMore || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, error, loadMore]);

  if (isLoading && posts.length === 0) {
    return (
      <div
        className="flex min-h-48 items-center justify-center rounded-2xl border border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-900"
        role="status"
        aria-live="polite"
      >
        <LoaderCircle
          className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">
          Loading posts...
        </span>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-white p-5 text-center dark:border-red-900 dark:bg-slate-900"
        role="alert"
      >
        <AlertCircle
          className="mx-auto mb-2 h-6 w-6 text-red-500"
          aria-hidden="true"
        />

        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white px-5 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">{emptyMessage}</p>

        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh feed
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-5" aria-label="Posts feed">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onEdit={onEditPost}
          onPostDeleted={handlePostDeleted}
        />
      ))}

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadMore()}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Retry loading more posts
          </button>
        </div>
      )}

      {hasMore && !error && (
        <div
          ref={sentinelRef}
          className="flex min-h-12 items-center justify-center"
          aria-live="polite"
        >
          {isLoadingMore && (
            <>
              <LoaderCircle
                className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                Loading more posts...
              </span>
            </>
          )}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={isLoadingMore || isLoading}
            className="rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {!hasMore && (
        <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
          You're all caught up.
        </p>
      )}
    </section>
  );
}
