import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";

import type { Post } from "@/features/posts/types/post.types";

interface PostCodeSnippetsProps {
  post: Post;
}

export default function PostCodeSnippets({ post }: PostCodeSnippetsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const snippets = post.codeSnippets ?? [];

  if (snippets.length === 0) return null;

  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);

      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 1800);
    } catch {
      setCopiedIndex(null);
    }
  };

  return (
    <section className="mt-4 min-w-0 space-y-4" aria-label="Post code snippets">
      {snippets.map((snippet, index) => (
        <div
          key={`${snippet.language}-${index}`}
          className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-700"
        >
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-200">
              <Code2
                size={16}
                className="shrink-0 text-blue-300"
                aria-hidden="true"
              />
              <span className="truncate font-medium">
                {snippet.language || "Code"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void handleCopy(snippet.code, index)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label={copiedIndex === index ? "Code copied" : "Copy code"}
            >
              {copiedIndex === index ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} aria-hidden="true" />
                  Copy
                </>
              )}
            </button>
          </div>

          <pre className="max-h-[520px] max-w-full overflow-auto p-4 text-sm leading-6 text-slate-100">
            <code>{snippet.code}</code>
          </pre>
        </div>
      ))}
    </section>
  );
}
