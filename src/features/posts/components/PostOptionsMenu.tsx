import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface PostOptionsMenuProps {
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export default function PostOptionsMenu({
  isOwner,
  onEdit,
  onDelete,
  isDeleting = false,
}: PostOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOwner || (!onEdit && !onDelete)) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900"
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Post actions"
          className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-blue-100 bg-white p-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20"
        >
          {onEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:bg-blue-50 focus-visible:outline-none dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300 dark:focus-visible:bg-slate-800"
            >
              <Pencil size={16} aria-hidden="true" />
              Edit post
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              role="menuitem"
              disabled={isDeleting}
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30 dark:focus-visible:bg-red-950/30"
            >
              <Trash2 size={16} aria-hidden="true" />
              {isDeleting ? "Deleting…" : "Delete post"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
