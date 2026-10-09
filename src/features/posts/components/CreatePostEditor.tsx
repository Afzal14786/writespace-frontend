import { lazy, Suspense, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { User } from "lucide-react";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import type { Post } from "@/types/api.types";

interface CreatePostEditorProps {
  onPostCreated?: (newPost: Post) => void;
  editPost?: Post;
  onCloseEdit?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

const CreatePostEditorModal = lazy(() => import("./CreatePostEditorModal"));

function EditorLoadingFallback() {
  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl bg-white px-5 py-4 text-sm text-slate-700 shadow-xl dark:bg-slate-900 dark:text-slate-200">
        Opening editor...
      </div>
    </div>
  );
}

export default function CreatePostEditor({
  onPostCreated,
  editPost,
  onCloseEdit,
  onPostUpdated,
}: CreatePostEditorProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "rgba(0,0,0,0.2)" : "#f8fafc";

  // Editing loads the modal directly; creating loads it on demand.
  if (editPost) {
    return (
      <Suspense fallback={<EditorLoadingFallback />}>
        <CreatePostEditorModal
          editPost={editPost}
          onCloseEdit={onCloseEdit}
          onPostUpdated={onPostUpdated}
          initiallyExpanded
        />
      </Suspense>
    );
  }

  return (
    <>
      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: "12px",
          border: `1px solid ${borderColor}`,
          padding: "1rem",
          boxShadow: isDark
            ? "0 4px 6px rgba(0,0,0,0.2)"
            : "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <RouterLink
            to={`/profile/${user?.username}`}
            style={{ textDecoration: "none" }}
            aria-label="View your profile"
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: isDark ? "#334155" : "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Your profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <User size={20} color={mutedText} />
              )}
            </div>
          </RouterLink>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "24px",
              textAlign: "left",
              border: `1px solid ${borderColor}`,
              backgroundColor: inputBg,
              color: mutedText,
              outline: "none",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Start a post...
          </button>
        </div>
      </div>

      {isOpen && (
        <Suspense fallback={<EditorLoadingFallback />}>
          <CreatePostEditorModal
            initiallyExpanded
            onPostCreated={(post) => {
              onPostCreated?.(post);
              setIsOpen(false);
            }}
            onCloseCreate={() => setIsOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
