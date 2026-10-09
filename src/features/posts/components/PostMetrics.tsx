import { MessageCircle, Eye, Heart, Share2 } from "lucide-react";

import type { Post } from "@/features/posts/types/post.types";

interface PostMetricsProps {
  post: Post;
  likeCount?: number;
  onCommentsClick?: () => void;
}

function formatCount(value: number | undefined): string {
  const count = Number.isFinite(value) ? Math.max(0, value ?? 0) : 0;

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(count >= 10_000_000 ? 0 : 1)}M`;
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(count >= 10_000 ? 0 : 1)}K`;
  }

  return String(count);
}

export default function PostMetrics({
  post,
  likeCount,
  onCommentsClick,
}: PostMetricsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400">
        <Heart size={14} aria-hidden="true" />
        <span>{formatCount(likeCount ?? post.likeCount)}</span>
        <span className="sr-only">likes</span>
      </span>

      <button
        type="button"
        onClick={onCommentsClick}
        disabled={!onCommentsClick}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 disabled:cursor-default disabled:hover:text-slate-500 dark:hover:text-blue-400 dark:disabled:hover:text-slate-400"
        aria-label={`${post.commentCount ?? 0} comments`}
      >
        <MessageCircle size={14} aria-hidden="true" />
        <span>{formatCount(post.commentCount)}</span>
      </button>

      <span className="inline-flex items-center gap-1.5">
        <Share2 size={14} aria-hidden="true" />
        <span>{formatCount(post.shareCount)}</span>
        <span className="sr-only">shares</span>
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Eye size={14} aria-hidden="true" />
        <span>{formatCount(post.viewCount)}</span>
        <span className="sr-only">views</span>
      </span>
    </div>
  );
}
