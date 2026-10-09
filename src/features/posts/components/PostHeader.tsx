import { Link } from "react-router-dom";
import { CalendarDays, LoaderCircle } from "lucide-react";

import type { Post } from "@/features/posts/types/post.types";

interface PostHeaderProps {
  post: Post;
  isFollowing?: boolean;
  isFollowingLoading?: boolean;
  onFollowToggle?: () => void;
  isOwnPost?: boolean;
}

function formatPostDate(value?: string | Date | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PostHeader({
  post,
  isFollowing = false,
  isFollowingLoading = false,
  onFollowToggle,
  isOwnPost = false,
}: PostHeaderProps) {
  const author = post.author;
  const displayName = author?.fullname || author?.username || "Writer";
  const username = author?.username;
  const avatarUrl = author?.profileImageUrl;
  const publishedAt = formatPostDate(post.publishDate || post.createdAt);

  return (
    <header className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-blue-100 bg-blue-50 dark:border-slate-700 dark:bg-slate-800">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${displayName}'s profile`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayName}
            </span>

            {username && (
              <Link
                to={`/profile/${encodeURIComponent(username)}`}
                className="truncate text-sm text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                @{username}
              </Link>
            )}
          </div>

          {publishedAt && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <CalendarDays size={13} aria-hidden="true" />
              <time dateTime={String(post.publishDate || post.createdAt)}>
                {publishedAt}
              </time>

              {typeof post.readTime === "number" && post.readTime > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime} min read</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {!isOwnPost && onFollowToggle && (
        <button
          type="button"
          onClick={onFollowToggle}
          disabled={isFollowingLoading}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isFollowing
              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
              : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          }`}
        >
          {isFollowingLoading ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </header>
  );
}
