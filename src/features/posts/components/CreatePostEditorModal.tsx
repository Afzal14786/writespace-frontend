import React, { useState, useEffect, type KeyboardEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  User,
  Image as ImageIcon,
  CodeXml,
  X,
  Send,
  CheckCircle,
  Loader2,
  Hash,
  Bold,
  Italic,
  Link as LinkIcon,
  Save,
  Sparkles,
} from "lucide-react";
import { AIAPI, type PostAssistantResult } from "@/features/ai/ai.api";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { ApiError } from "@/types/ApiError";
import type { Post } from "@/types/api.types";

import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";

import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubLight } from "@uiw/codemirror-theme-github";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";

import { PostsAPI } from "@/features/posts/posts.api";

interface CreatePostEditorProps {
  onPostCreated?: (newPost: Post) => void;
  editPost?: Post;
  onCloseEdit?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
  initiallyExpanded?: boolean;
  onCloseCreate?: () => void;
}

interface CodeSnippet {
  id: string;
  language: string;
  code: string;
}

interface DraftState {
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  codeSnippets: CodeSnippet[];
}

const CreatePostEditor: React.FC<CreatePostEditorProps> = ({
  onPostCreated,
  editPost,
  onCloseEdit,
  onPostUpdated,
  initiallyExpanded = false,
  onCloseCreate,
}) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";
  const isEditMode = Boolean(editPost);

  const [isExpanded, setIsExpanded] = useState(isEditMode || initiallyExpanded);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"Saving..." | "Saved" | "">(
    "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [postStatus, setPostStatus] = useState<
    "draft" | "scheduled" | "published"
  >(
    editPost?.status === "scheduled" || editPost?.status === "published"
      ? editPost.status
      : "draft",
  );

  const [scheduledAt, setScheduledAt] = useState(
    editPost?.scheduledAt
      ? new Date(editPost.scheduledAt).toISOString().slice(0, 16)
      : "",
  );

  const [title, setTitle] = useState(editPost?.title || "");
  const [subtitle, setSubtitle] = useState(editPost?.subtitle || "");

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiResult, setAiResult] = useState<PostAssistantResult | null>(null);

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>(
    editPost?.media || [],
  );
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    editPost?.coverImageUrl || null,
  );
  const [existingMediaPublicIds, setExistingMediaPublicIds] = useState<
    string[]
  >(editPost?.mediaPublicIds || []);

  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>(() =>
    (editPost?.codeSnippets || []).map((snippet) => ({
      id: crypto.randomUUID(),
      language: snippet.language,
      code: snippet.code,
    })),
  );

  const [tags, setTags] = useState<string[]>(editPost?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";
  const linkColor = "#3b82f6";
  const inputBg = isDark ? "rgba(0,0,0,0.2)" : "#f8fafc";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: `color: ${linkColor}; font-weight: bold; text-decoration: underline; cursor: pointer;`,
        },
      }),
      Placeholder.configure({
        placeholder: "Share your knowledge, code, or ideas...",
      }),
    ],
    content: editPost?.content || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[120px]",
        style: `color: ${textColor}; min-height: 120px; outline: none; font-size: 1rem; line-height: 1.6;`,
      },
    },
  });

  // Restore a saved draft when creating a new post.
  useEffect(() => {
    if (isEditMode) {
      setIsDraftLoaded(true);
      return;
    }

    if (!editor || isDraftLoaded) return;

    const savedDraft = localStorage.getItem("writespace_draft");

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as DraftState;

        if (parsed.title) setTitle(parsed.title);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (Array.isArray(parsed.tags)) setTags(parsed.tags);
        if (Array.isArray(parsed.codeSnippets)) {
          setCodeSnippets(parsed.codeSnippets);
        }
        if (parsed.content) {
          editor.commands.setContent(parsed.content);
        }

        if (
          parsed.title ||
          parsed.subtitle ||
          parsed.content ||
          parsed.tags?.length ||
          parsed.codeSnippets?.length
        ) {
          setDraftStatus("Saved");
        }
      } catch (error: unknown) {
        console.error("Failed to parse WriteSpace draft:", error);
        localStorage.removeItem("writespace_draft");
      }
    }

    setIsDraftLoaded(true);
  }, [editor, isDraftLoaded, isEditMode]);

  // Autosave the new-post draft.
  useEffect(() => {
    if (!isExpanded || !isDraftLoaded || isEditMode) return;

    const liveHtml = editor?.getHTML() || "";
    const liveText = editor?.getText() || "";

    const hasContent = Boolean(
      title.trim() ||
      subtitle.trim() ||
      liveText.trim() ||
      codeSnippets.length ||
      tags.length,
    );

    if (!hasContent) {
      localStorage.removeItem("writespace_draft");
      setDraftStatus("");
      return;
    }

    setDraftStatus("Saving...");

    const saveTimer = window.setTimeout(() => {
      const draft: DraftState = {
        title,
        subtitle,
        content: liveHtml,
        tags,
        codeSnippets,
      };

      localStorage.setItem("writespace_draft", JSON.stringify(draft));
      setDraftStatus("Saved");
    }, 1000);

    return () => window.clearTimeout(saveTimer);
  }, [
    title,
    subtitle,
    tags,
    codeSnippets,
    isExpanded,
    isDraftLoaded,
    isEditMode,
    editor,
  ]);

  // Lock background scrolling while the modal is open and restore
  // the previous value when it closes or unmounts.
  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded]);

  const resetForm = () => {
    localStorage.removeItem("writespace_draft");

    setTitle("");
    setSubtitle("");
    setTags([]);
    setTagInput("");
    setPostStatus("draft");
    setScheduledAt("");

    mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    setMediaFiles([]);
    setMediaPreviews([]);
    setExistingMedia([]);
    setExistingMediaPublicIds([]);
    setCodeSnippets([]);

    editor?.commands.setContent("");

    setDraftStatus("");
    setIsExpanded(false);

    if (bannerPreview && bannerFile) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleDiscard = () => {
    if (isSubmitting) return;

    if (isEditMode) {
      onCloseEdit?.();
      return;
    }

    const liveText = editor?.getText() || "";

    const hasUnsavedContent = Boolean(
      title.trim() ||
      subtitle.trim() ||
      liveText.trim() ||
      mediaFiles.length ||
      codeSnippets.length ||
      tags.length ||
      existingMedia.length ||
      bannerFile,
    );

    if (hasUnsavedContent && !window.confirm("Discard draft?")) {
      return;
    }

    resetForm();
    onCloseCreate?.();
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      const newTag = tagInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      if (!newTag) {
        setTagInput("");
        return;
      }

      if (tags.includes(newTag)) {
        setTagInput("");
        return;
      }

      if (tags.length >= 5) {
        toast.warning("Maximum 5 tags allowed.");
        return;
      }

      setTags((previous) => [...previous, newTag]);
      setTagInput("");
    } else if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((previous) => previous.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((previous) => previous.filter((tag) => tag !== tagToRemove));
  };

  const handleGenerateAiSuggestions = async () => {
    const content = editor?.getText().trim() ?? "";

    if (!content) {
      toast.info("Write some content before generating AI suggestions.");
      return;
    }

    setIsAiLoading(true);
    setAiResult(null);

    try {
      const result = await AIAPI.generatePostAssistant({
        title: title.trim() || undefined,
        content,
        instruction: aiInstruction.trim() || undefined,
      });

      setAiResult(result);
      toast.success("AI suggestions generated.");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;

      toast.error(
        message || "Unable to generate AI suggestions. Please try again.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const finalHtml = editor?.getHTML() || "";
    const finalText = editor?.getText() || "";
    const finalTitle = title.trim();

    if (finalTitle.length < 5) {
      toast.error("Title must be at least 5 characters.");
      return;
    }

    if (
      finalText.trim().length < 10 &&
      codeSnippets.length === 0 &&
      mediaFiles.length === 0 &&
      existingMedia.length === 0
    ) {
      toast.error(
        "Content must be at least 10 characters or include media/code.",
      );
      return;
    }

    if (postStatus === "scheduled") {
      if (!scheduledAt) {
        toast.error("Please select a schedule date and time.");
        return;
      }

      const scheduledDate = new Date(scheduledAt);

      if (
        Number.isNaN(scheduledDate.getTime()) ||
        scheduledDate <= new Date()
      ) {
        toast.error("Scheduled time must be in the future.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", finalTitle);

      if (subtitle.trim()) {
        formData.append("subtitle", subtitle.trim());
      }

      formData.append("content", finalHtml);
      formData.append("status", postStatus);

      if (postStatus === "scheduled") {
        formData.append("scheduledAt", new Date(scheduledAt).toISOString());
      }

      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      if (codeSnippets.length > 0) {
        const cleanSnippets = codeSnippets.map(({ language, code }) => ({
          language,
          code,
        }));

        formData.append("codeSnippets", JSON.stringify(cleanSnippets));
      }

      if (isEditMode) {
        existingMedia.forEach((url) => {
          formData.append("existingMedia", url);
        });

        existingMediaPublicIds.forEach((publicId) => {
          formData.append("existingMediaPublicIds", publicId);
        });

        if (existingMedia.length === 0 && existingMediaPublicIds.length === 0) {
          formData.append("existingMedia", JSON.stringify([]));
          formData.append("existingMediaPublicIds", JSON.stringify([]));
        }
      }

      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      if (isEditMode && editPost) {
        const updatedPost = await PostsAPI.updatePost(editPost.id, formData);

        toast.success("Post updated successfully!");
        onPostUpdated?.(updatedPost);
        onCloseEdit?.();
      } else {
        const newPost = await PostsAPI.createPost(formData);

        if (postStatus === "draft") {
          toast.success("Draft saved successfully!");
        } else if (postStatus === "scheduled") {
          toast.success("Post scheduled successfully!");
        } else {
          toast.success("Post published successfully!");
        }

        resetForm();
        onPostCreated?.(newPost);
        onCloseCreate?.();
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;

      const actionText =
        postStatus === "draft"
          ? "save draft"
          : postStatus === "scheduled"
            ? "schedule post"
            : isEditMode
              ? "update post"
              : "publish post";

      toast.error(
        axiosError.response?.data?.message || `Failed to ${actionText}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    if (mediaFiles.length + existingMedia.length + newFiles.length > 10) {
      toast.warning("You can only attach a maximum of 10 images per post.");
      event.target.value = "";
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setMediaFiles((previous) => [...previous, ...newFiles]);
    setMediaPreviews((previous) => [...previous, ...newPreviews]);

    event.target.value = "";
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (bannerPreview && bannerFile) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));

    event.target.value = "";
  };

  const removeNewMedia = (indexToRemove: number) => {
    const preview = mediaPreviews[indexToRemove];

    if (preview) URL.revokeObjectURL(preview);

    setMediaFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );

    setMediaPreviews((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );
  };

  const removeExistingMedia = (indexToRemove: number) => {
    setExistingMedia((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );

    setExistingMediaPublicIds((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );
  };

  const getLanguageExtension = (language: string) => {
    switch (language.toLowerCase()) {
      case "python":
        return [python()];
      case "typescript":
        return [javascript({ typescript: true })];
      case "java":
        return [java()];
      case "cpp":
        return [cpp()];
      case "rust":
        return [rust()];
      case "go":
        return [go()];
      case "sql":
        return [sql()];
      default:
        return [javascript()];
    }
  };

  const addCodeSnippet = () => {
    setCodeSnippets((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        language: "typescript",
        code: "",
      },
    ]);
  };

  return (
    <>
      {!isExpanded && !isEditMode && (
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
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <RouterLink
              to={`/profile/${authUser?.username}`}
              style={{ textDecoration: "none" }}
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
                  cursor: "pointer",
                }}
              >
                {authUser?.profileImageUrl ? (
                  <img
                    src={authUser.profileImageUrl}
                    alt="You"
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
              onClick={() => setIsExpanded(true)}
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
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9990,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "5vh",
              paddingLeft: "10px",
              paddingRight: "10px",
              backgroundColor: isDark
                ? "rgba(0,0,0,0.7)"
                : "rgba(255,255,255,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                backgroundColor: cardBg,
                borderRadius: "12px",
                width: "100%",
                maxWidth: "650px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                overflow: "hidden",
              }}
            >
              {/* Modal header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <RouterLink
                  to={`/profile/${authUser?.username}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: isDark ? "#334155" : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {authUser?.profileImageUrl ? (
                        <img
                          src={authUser.profileImageUrl}
                          alt="You"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <User size={18} color={mutedText} />
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: textColor,
                        }}
                      >
                        {authUser?.fullname || "User"}
                      </span>

                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: isEditMode
                            ? accentColor
                            : draftStatus === "Saved"
                              ? "#10b981"
                              : mutedText,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {isEditMode ? (
                          "Editing Post..."
                        ) : draftStatus === "Saved" ? (
                          <>
                            <CheckCircle size={10} />
                            Saved
                          </>
                        ) : (
                          draftStatus || "Draft"
                        )}
                      </span>
                    </div>
                  </div>
                </RouterLink>

                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isSubmitting}
                  aria-label="Close editor"
                  style={{
                    background: "none",
                    border: "none",
                    color: mutedText,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Editor body */}
              <div
                style={{
                  padding: 0,
                  overflowY: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <input
                  type="text"
                  placeholder="Post Title..."
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    outline: "none",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "inherit",
                  }}
                />

                <input
                  type="text"
                  placeholder="Add a subtitle..."
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                  maxLength={300}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "10px 20px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${borderColor}`,
                    color: mutedText,
                    outline: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    fontFamily: "inherit",
                  }}
                />

                <div style={{ padding: "16px 20px" }}>
                  {/* AI Post Assistant */}
                  <div
                    style={{
                      margin: "12px 20px 0",
                      padding: "14px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "12px",
                      background: isDark
                        ? "rgba(99, 102, 241, 0.08)"
                        : "rgba(99, 102, 241, 0.04)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsAiOpen((open) => !open)}
                      aria-expanded={isAiOpen}
                      disabled={isSubmitting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        color: textColor,
                        cursor: "pointer",
                        fontWeight: 700,
                        textAlign: "left",
                      }}
                    >
                      <Sparkles size={18} color={accentColor} />
                      AI Post Assistant
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.8rem",
                          color: mutedText,
                        }}
                      >
                        {isAiOpen ? "Hide" : "Generate suggestions"}
                      </span>
                    </button>

                    {isAiOpen && (
                      <div style={{ marginTop: "14px" }}>
                        <label
                          htmlFor="ai-post-instruction"
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            color: mutedText,
                            fontSize: "0.85rem",
                          }}
                        >
                          Optional instructions
                        </label>

                        <textarea
                          id="ai-post-instruction"
                          value={aiInstruction}
                          onChange={(event) =>
                            setAiInstruction(event.target.value)
                          }
                          maxLength={1000}
                          rows={2}
                          placeholder="e.g. Make it beginner-friendly with practical examples"
                          disabled={isAiLoading || isSubmitting}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            resize: "vertical",
                            padding: "10px",
                            borderRadius: "8px",
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                            font: "inherit",
                            fontSize: "0.9rem",
                          }}
                        />

                        <button
                          type="button"
                          onClick={handleGenerateAiSuggestions}
                          disabled={isAiLoading || isSubmitting}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            marginTop: "10px",
                            padding: "9px 14px",
                            border: "none",
                            borderRadius: "8px",
                            background: accentColor,
                            color: "#fff",
                            fontWeight: 600,
                            cursor:
                              isAiLoading || isSubmitting
                                ? "not-allowed"
                                : "pointer",
                            opacity: isAiLoading || isSubmitting ? 0.7 : 1,
                          }}
                        >
                          {isAiLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                          {isAiLoading
                            ? "Generating..."
                            : "Generate suggestions"}
                        </button>

                        {aiResult && (
                          <div
                            style={{
                              marginTop: "16px",
                              display: "grid",
                              gap: "14px",
                            }}
                          >
                            {/* Suggested title */}
                            <div>
                              <strong style={{ color: textColor }}>
                                Suggested title
                              </strong>
                              <p
                                style={{
                                  color: mutedText,
                                  margin: "6px 0 8px",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {aiResult.suggestedTitle}
                              </p>

                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                  setTitle(aiResult.suggestedTitle);
                                  toast.success("Suggested title applied.");
                                }}
                                style={{
                                  border: `1px solid ${borderColor}`,
                                  borderRadius: "7px",
                                  padding: "6px 10px",
                                  background: "transparent",
                                  color: textColor,
                                  cursor: "pointer",
                                }}
                              >
                                Apply title
                              </button>
                            </div>

                            {/* Suggested summary */}
                            <div>
                              <strong style={{ color: textColor }}>
                                Summary
                              </strong>
                              <p
                                style={{
                                  color: mutedText,
                                  margin: "6px 0 8px",
                                  lineHeight: 1.6,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {aiResult.summary}
                              </p>

                              <button
                                type="button"
                                disabled={isSubmitting || !editor}
                                onClick={() => {
                                  if (!editor) return;

                                  editor
                                    .chain()
                                    .focus()
                                    .insertContent({
                                      type: "paragraph",
                                      content: [
                                        {
                                          type: "text",
                                          text: aiResult.summary,
                                        },
                                      ],
                                    })
                                    .run();

                                  toast.success(
                                    "Summary inserted into your post.",
                                  );
                                }}
                                style={{
                                  border: `1px solid ${borderColor}`,
                                  borderRadius: "7px",
                                  padding: "6px 10px",
                                  background: "transparent",
                                  color: textColor,
                                  cursor: "pointer",
                                }}
                              >
                                Insert summary
                              </button>
                            </div>

                            {/* Suggested topics */}
                            <div>
                              <strong style={{ color: textColor }}>
                                Suggested topics
                              </strong>

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  margin: "8px 0",
                                }}
                              >
                                {aiResult.topics.map((topic, index) => (
                                  <span
                                    key={`${topic}-${index}`}
                                    style={{
                                      padding: "5px 9px",
                                      borderRadius: "16px",
                                      background: `${accentColor}20`,
                                      color: accentColor,
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    #{topic.replace(/^#+/, "")}
                                  </span>
                                ))}
                              </div>

                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                  const normalizedTopics = aiResult.topics
                                    .map((topic) =>
                                      topic.trim().replace(/^#+/, ""),
                                    )
                                    .filter(Boolean);

                                  const mergedTopics = Array.from(
                                    new Set([...tags, ...normalizedTopics]),
                                  );

                                  setTags(mergedTopics.slice(0, 5));

                                  if (mergedTopics.length > 5) {
                                    toast.info(
                                      "Only five tags are allowed. Some suggestions were skipped.",
                                    );
                                  } else if (
                                    mergedTopics.length > tags.length
                                  ) {
                                    toast.success("Suggested topics added.");
                                  } else {
                                    toast.info(
                                      "These topics are already added.",
                                    );
                                  }
                                }}
                                style={{
                                  border: `1px solid ${borderColor}`,
                                  borderRadius: "7px",
                                  padding: "6px 10px",
                                  background: "transparent",
                                  color: textColor,
                                  cursor: "pointer",
                                }}
                              >
                                Add topics
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{ minHeight: "100px", cursor: "text" }}
                    onClick={() => editor?.commands.focus()}
                  >
                    {editor && <EditorContent editor={editor} />}
                  </div>

                  {/* Cover image */}
                  {bannerPreview && (
                    <div
                      style={{
                        marginTop: "16px",
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      <img
                        src={bannerPreview}
                        alt="Cover preview"
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      <button
                        type="button"
                        disabled={isSubmitting}
                        aria-label="Remove cover image"
                        onClick={() => {
                          if (bannerPreview && bannerFile) {
                            URL.revokeObjectURL(bannerPreview);
                          }

                          setBannerFile(null);
                          setBannerPreview(editPost?.coverImageUrl || null);
                        }}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Code snippets */}
                  {codeSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      style={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: `1px solid ${borderColor}`,
                        marginTop: "16px",
                        backgroundColor: isDark ? "#0d1117" : "#f8fafc",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          borderBottom: `1px solid ${borderColor}`,
                        }}
                      >
                        <div style={{ display: "flex", gap: "6px" }}>
                          {["#ff5f56", "#ffbd2e", "#27c93f"].map((color) => (
                            <div
                              key={color}
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: color,
                              }}
                            />
                          ))}
                        </div>

                        <select
                          aria-label="Code language"
                          value={snippet.language}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            setCodeSnippets((previous) =>
                              previous.map((item) =>
                                item.id === snippet.id
                                  ? {
                                      ...item,
                                      language: event.target.value,
                                    }
                                  : item,
                              ),
                            )
                          }
                          style={{
                            backgroundColor: "transparent",
                            color: mutedText,
                            border: "none",
                            outline: "none",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <option value="python">Python</option>
                          <option value="typescript">TypeScript</option>
                          <option value="javascript">JavaScript</option>
                          <option value="rust">Rust</option>
                          <option value="go">Go</option>
                          <option value="cpp">C / C++</option>
                          <option value="java">Java</option>
                          <option value="sql">SQL</option>
                        </select>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          aria-label="Remove code snippet"
                          onClick={() =>
                            setCodeSnippets((previous) =>
                              previous.filter((item) => item.id !== snippet.id),
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <CodeMirror
                        value={snippet.code}
                        height="auto"
                        minHeight="80px"
                        maxHeight="300px"
                        theme={isDark ? vscodeDark : githubLight}
                        extensions={getLanguageExtension(snippet.language)}
                        onChange={(value) =>
                          setCodeSnippets((previous) =>
                            previous.map((item) =>
                              item.id === snippet.id
                                ? { ...item, code: value }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}

                  {/* Existing and newly uploaded media */}
                  {(existingMedia.length > 0 || mediaPreviews.length > 0) && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "16px",
                        overflowX: "auto",
                        paddingBottom: "8px",
                      }}
                    >
                      {existingMedia.map((url, index) => (
                        <div
                          key={`existing-${url}-${index}`}
                          style={{
                            position: "relative",
                            flexShrink: 0,
                            width: "120px",
                            height: "120px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <img
                            src={url}
                            alt={`Existing media ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              backgroundColor: isDark ? "#000" : "#f1f5f9",
                            }}
                          />

                          <button
                            type="button"
                            disabled={isSubmitting}
                            aria-label="Remove existing image"
                            onClick={() => removeExistingMedia(index)}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {mediaPreviews.map((preview, index) => (
                        <div
                          key={`new-${preview}`}
                          style={{
                            position: "relative",
                            flexShrink: 0,
                            width: "120px",
                            height: "120px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <img
                            src={preview}
                            alt={`New media ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              backgroundColor: isDark ? "#000" : "#f1f5f9",
                            }}
                          />

                          <button
                            type="button"
                            disabled={isSubmitting}
                            aria-label="Remove uploaded image"
                            onClick={() => removeNewMedia(index)}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div
                    style={{
                      marginTop: "24px",
                      paddingTop: "16px",
                      borderTop: `1px solid ${borderColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <Hash size={16} color={mutedText} />

                      {tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: `${accentColor}20`,
                            color: accentColor,
                            padding: "4px 10px",
                            borderRadius: "16px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          #{tag}
                          <button
                            type="button"
                            disabled={isSubmitting}
                            aria-label={`Remove tag ${tag}`}
                            onClick={() => removeTag(tag)}
                            style={{
                              background: "none",
                              border: "none",
                              color: accentColor,
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                            }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}

                      {tags.length < 5 && (
                        <input
                          type="text"
                          placeholder={
                            tags.length === 0
                              ? "Add tags (e.g. javascript)..."
                              : "Add another tag..."
                          }
                          value={tagInput}
                          disabled={isSubmitting}
                          onChange={(event) => setTagInput(event.target.value)}
                          onKeyDown={handleTagKeyDown}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: textColor,
                            outline: "none",
                            fontSize: "0.85rem",
                            minWidth: "120px",
                            flex: 1,
                          }}
                        />
                      )}
                    </div>

                    {tags.length === 0 && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: mutedText,
                          marginLeft: "24px",
                        }}
                      >
                        Press Enter or comma to add
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scheduling controls */}
              {postStatus === "scheduled" && (
                <div
                  style={{
                    padding: "12px 20px 0",
                  }}
                >
                  <label
                    htmlFor="scheduled-at"
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: mutedText,
                      marginBottom: "6px",
                    }}
                  >
                    Schedule publication
                  </label>

                  <input
                    id="scheduled-at"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                      backgroundColor: inputBg,
                      color: textColor,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}

              {/* Modal footer */}
              <div
                style={{
                  padding: "1rem",
                  borderTop: `1px solid ${borderColor}`,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    aria-label="Bold"
                    disabled={isSubmitting}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    style={{
                      background: "none",
                      border: "none",
                      color: editor?.isActive("bold") ? accentColor : mutedText,
                      cursor: "pointer",
                    }}
                  >
                    <Bold size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Italic"
                    disabled={isSubmitting}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    style={{
                      background: "none",
                      border: "none",
                      color: editor?.isActive("italic")
                        ? accentColor
                        : mutedText,
                      cursor: "pointer",
                    }}
                  >
                    <Italic size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Add link"
                    disabled={isSubmitting}
                    onClick={() => {
                      const url = window.prompt("Enter URL:");

                      if (url && editor) {
                        editor.chain().focus().setLink({ href: url }).run();
                      } else if (url === "") {
                        editor?.chain().focus().unsetLink().run();
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: editor?.isActive("link") ? linkColor : mutedText,
                      cursor: "pointer",
                    }}
                  >
                    <LinkIcon size={18} />
                  </button>

                  <div
                    style={{
                      width: "1px",
                      height: "20px",
                      backgroundColor: borderColor,
                      margin: "0 4px",
                    }}
                  />

                  <input
                    type="file"
                    id="banner-image-upload"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    disabled={isSubmitting}
                    style={{ display: "none" }}
                    onChange={handleBannerUpload}
                  />

                  <label
                    htmlFor="banner-image-upload"
                    title="Set cover image"
                    style={{
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      color:
                        bannerFile || editPost?.coverImageUrl
                          ? accentColor
                          : mutedText,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ImageIcon size={20} />
                  </label>

                  <input
                    type="file"
                    id="modal-image-upload"
                    accept="image/*"
                    multiple
                    disabled={isSubmitting}
                    style={{ display: "none" }}
                    onChange={handleMediaUpload}
                  />

                  <label
                    htmlFor="modal-image-upload"
                    title="Attach images"
                    style={{
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      color: mutedText,
                    }}
                  >
                    <ImageIcon size={20} />
                  </label>

                  <button
                    type="button"
                    aria-label="Add code snippet"
                    disabled={isSubmitting}
                    onClick={addCodeSnippet}
                    style={{
                      background: "none",
                      border: "none",
                      color: mutedText,
                      cursor: "pointer",
                    }}
                  >
                    <CodeXml size={20} />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    aria-label="Post status"
                    value={postStatus}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      const newStatus = event.target.value as
                        | "draft"
                        | "scheduled"
                        | "published";

                      setPostStatus(newStatus);

                      if (newStatus !== "scheduled") {
                        setScheduledAt("");
                      }
                    }}
                    style={{
                      backgroundColor: inputBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      padding: "8px 10px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Schedule</option>
                    <option value="published">Publish</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      padding: "8px 24px",
                      borderRadius: "24px",
                      fontWeight: 600,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        {postStatus === "draft"
                          ? "Save Draft"
                          : postStatus === "scheduled"
                            ? "Schedule"
                            : isEditMode
                              ? "Save Changes"
                              : "Publish"}

                        {postStatus === "draft" ? (
                          <Save size={16} />
                        ) : (
                          <Send size={16} />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreatePostEditor;
