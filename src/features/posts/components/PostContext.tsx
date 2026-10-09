import { Link } from "react-router-dom";

import type { Post } from "@/features/posts/types/post.types";

interface PostContextProps {
  post: Post;
  showFullContent?: boolean;
  postDetailPath?: string;
}

function containsHtml(content: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(content);
}

function getPlainText(content: string): string {
  if (!containsHtml(content)) {
    return content;
  }

  const parsedDocument = new DOMParser().parseFromString(content, "text/html");

  return parsedDocument.body.textContent || "";
}

export default function PostContext({
  post,
  showFullContent = false,
  postDetailPath,
}: PostContextProps) {
  const tags = post.tags ?? [];

  // Prefer the complete content, falling back to the excerpt.
  const content = post.content?.trim() || post.excerpt?.trim() || "";

  const isHtml = containsHtml(content);
  const plainText = getPlainText(content).trim();

  // Limit feed previews to 280 characters.
  const previewLimit = 280;
  const isLongPreview = plainText.length > previewLimit;

  const displayedText =
    !showFullContent && isLongPreview
      ? `${plainText.slice(0, previewLimit).trimEnd()}…`
      : plainText;

  const contentStyles =
    "[&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline " +
    "[&_a]:underline-offset-2 [&_a:hover]:text-blue-700 " +
    "[&_blockquote]:border-l-2 [&_blockquote]:border-blue-200 " +
    "[&_blockquote]:pl-4 [&_ol]:list-decimal [&_ol]:pl-5 " +
    "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_pre]:max-w-full " +
    "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-50 " +
    "[&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 " +
    "dark:[&_a]:text-blue-400 dark:[&_blockquote]:border-slate-700 " +
    "dark:[&_pre]:bg-slate-800";

  return (
    <section className="min-w-0">
      {post.title && (
        <h2 className="break-words text-xl font-bold leading-snug text-slate-900 dark:text-gray-100">
          {postDetailPath ? (
            <Link
              to={postDetailPath}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </h2>
      )}

      {post.subtitle && (
        <p className="mt-2 break-words text-base leading-6 text-slate-600 dark:text-gray-300">
          {post.subtitle}
        </p>
      )}

      {content && (
        <div className="mt-3 break-words text-sm leading-7 text-slate-700 dark:text-gray-300">
          {showFullContent && isHtml ? (
            <div
              className={contentStyles}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{displayedText}</p>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300"
            >
              #{tag.replace(/^#/, "")}
            </span>
          ))}
        </div>
      )}

      {postDetailPath && (
        <Link
          to={postDetailPath}
          className="mt-3 inline-flex rounded-md text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400 dark:focus-visible:ring-offset-slate-900"
        >
          Read full post →
        </Link>
      )}
    </section>
  );
}
