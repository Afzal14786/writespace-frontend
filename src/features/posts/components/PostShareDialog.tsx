import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Link2, X } from "lucide-react";

import { usePostShare } from "@/features/posts/hooks/usePostShare";

interface PostShareDialogProps {
  postId: string;
  postTitle?: string;
  open: boolean;
  onClose: () => void;
}

export default function PostShareDialog({
  postId,
  postTitle,
  open,
  onClose,
}: PostShareDialogProps) {
  const { isSharing, sharePost } = usePostShare(postId);

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setError(null);
      setShareUrl("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopyLink = async () => {
    setError(null);
    setCopied(false);

    try {
      const result = await sharePost("copy");

      await navigator.clipboard.writeText(result.url);

      setShareUrl(result.url);
      setCopied(true);
    } catch (cause) {
      console.error("Failed to copy post link:", cause);
      setError(
        "Could not copy the link. Check your browser permissions and try again.",
      );
    }
  };

  const handleNativeShare = async () => {
    setError(null);
    setCopied(false);

    try {
      const result = await sharePost("native");

      setShareUrl(result.url);

      if (typeof navigator.share !== "function") {
        await navigator.clipboard.writeText(result.url);
        setCopied(true);
        return;
      }

      await navigator.share({
        title: postTitle || "Check out this post",
        url: result.url,
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") {
        return;
      }

      console.error("Failed to share post:", cause);
      setError("Sharing failed. Please try copying the link instead.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-share-title"
        className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300">
              <Link2 size={20} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2
                id="post-share-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                Share post
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this post with others
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {postTitle && (
          <p className="mt-4 line-clamp-2 break-words rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {postTitle}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            disabled={isSharing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
          >
            {copied ? (
              <Check size={18} aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}

            {isSharing
              ? "Preparing link…"
              : copied
                ? "Link copied"
                : "Copy link"}
          </button>

          <button
            type="button"
            onClick={() => void handleNativeShare()}
            disabled={isSharing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
          >
            <ExternalLink size={18} aria-hidden="true" />
            {isSharing ? "Preparing share…" : "Share using your device"}
          </button>
        </div>

        {shareUrl && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Share link
            </p>
            <p className="break-all text-xs leading-5 text-slate-700 dark:text-slate-200">
              {shareUrl}
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
