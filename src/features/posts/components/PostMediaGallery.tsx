import { useState } from "react";

import type { Post } from "@/features/posts/types/post.types";

interface PostMediaGalleryProps {
  post: Post;
}

export default function PostMediaGallery({ post }: PostMediaGalleryProps) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  // These fields may be null or undefined in the backend response.
  const media = post.media ?? [];
  const coverUrl = post.coverImageUrl || null;
  const coverAlt = post.coverImageAltText || post.title || "Post image";

  const visibleMedia = media.filter(
    (url, index) =>
      Boolean(url) &&
      url !== coverUrl &&
      media.indexOf(url) === index &&
      !failedUrls.includes(url),
  );

  const showCover = Boolean(coverUrl && !failedUrls.includes(coverUrl));

  if (!showCover && visibleMedia.length === 0) {
    return null;
  }

  const handleImageError = (url: string) => {
    setFailedUrls((current) =>
      current.includes(url) ? current : [...current, url],
    );
  };

  return (
    <div className="mt-4 min-w-0 space-y-2">
      {showCover && coverUrl && (
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800">
          <img
            src={coverUrl}
            alt={coverAlt}
            loading="lazy"
            onError={() => handleImageError(coverUrl)}
            className="max-h-[520px] w-full object-cover"
          />
        </div>
      )}

      {visibleMedia.length > 0 && (
        <div
          className={`grid min-w-0 gap-2 ${
            visibleMedia.length === 1
              ? "grid-cols-1"
              : visibleMedia.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {visibleMedia.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open attached image ${index + 1} in a new tab`}
              className="block min-w-0 overflow-hidden rounded-lg border border-blue-100 bg-blue-50/50 outline-none transition-colors hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700 dark:focus-visible:ring-offset-slate-900"
            >
              <img
                src={url}
                alt={`Post attachment ${index + 1}`}
                loading="lazy"
                onError={() => handleImageError(url)}
                className="aspect-square h-full w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
