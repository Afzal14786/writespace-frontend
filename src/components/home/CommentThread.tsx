import React, { useState, useEffect } from "react";
import { User, Heart, MessageSquare, Loader2, Trash2, Pencil, X, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import type { CommentData } from "../../types/api.types";
import { InteractionsAPI } from "../../api/interactions.api";

interface CommentThreadProps {
  comment: CommentData;
  postId: string;
  depth?: number;
  onDelete?: (commentId: string) => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({ comment, postId, depth = 0, onDelete }) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  // Responsive logic
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 480;

  const MAX_DEPTH = isMobile ? 3 : 5;

  // Optimistic UI State
  const [isLiked, setIsLiked] = useState<boolean>(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState<number>(comment.likeCount);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>(comment.content);
  const [currentContent, setCurrentContent] = useState<string>(comment.content);
  const [isEditedState, setIsEditedState] = useState<boolean>(comment.isEdited);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Reply State
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  
  // Nested Children State
  const [replies, setReplies] = useState<CommentData[]>([]);
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const isOwner = authUser?.id === comment.author.id;

  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";
  const inputBg = isDark ? "rgba(0,0,0,0.3)" : "#f3f4f6";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";

  const handleToggleLike = async () => {
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(prev => (previousIsLiked ? prev - 1 : prev + 1));

    try {
      await InteractionsAPI.toggleCommentLike(comment.id);
    } catch (error: unknown) {
      console.error(`Error while interaction :`, error);
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      toast.error("Failed to like comment");
    }
  };

  const handleFetchReplies = async (cursor?: string) => {
    if (isLoadingReplies) return;
    try {
      setIsLoadingReplies(true);
      setShowReplies(true); 
      const response = await InteractionsAPI.getCommentReplies(comment.id, cursor);
      if (cursor) {
        setReplies(prev => [...prev, ...response.replies]);
      } else {
        setReplies(response.replies);
      }
      setNextCursor(response.nextCursor);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to load replies");
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmittingReply) return;
    try {
      setIsSubmittingReply(true);
      const newReply = await InteractionsAPI.addComment(postId, replyText, comment.id);
      setReplies(prev => [newReply, ...prev]);
      setReplyText("");
      setIsReplying(false);
      setShowReplies(true); 
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim() || isSubmittingEdit || editContent === currentContent) {
      setIsEditing(false);
      return;
    }
    
    try {
      setIsSubmittingEdit(true);
      const updatedComment = await InteractionsAPI.updateComment(comment.id, editContent);
      setCurrentContent(updatedComment.content);
      setIsEditedState(true);
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteSelf = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await InteractionsAPI.deleteComment(comment.id);
      toast.success("Comment deleted");
      if (onDelete) onDelete(comment.id);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to delete comment");
    }
  };

  const handleChildDeleted = (deletedCommentId: string) => {
    setReplies(prev => prev.filter(r => r.id !== deletedCommentId));
  };

  const timeAgo = new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const avatarSize = depth === 0 ? (isMobile ? 32 : 36) : (isMobile ? 24 : 28);
  const iconSize = depth === 0 ? (isMobile ? 14 : 18) : (isMobile ? 12 : 14);
  const marginLeft = depth > 0 ? (isMobile ? "12px" : "20px") : "0px";

  return (
    <div style={{ display: "flex", gap: isMobile ? "8px" : "10px", marginTop: "16px", marginLeft }}>
      
      <div style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {comment.author.profileImageUrl ? (
          <img src={comment.author.profileImageUrl} alt={comment.author.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <User size={iconSize} color={mutedText} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        
        {/* Comment Bubble */}
        <div style={{ backgroundColor: inputBg, padding: isMobile ? "8px 12px" : "10px 14px", borderRadius: "0 12px 12px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: isMobile ? "0.8rem" : "0.85rem", color: textColor }}>
              {comment.author.fullname || comment.author.username}
            </span>
            <span style={{ fontSize: isMobile ? "0.65rem" : "0.7rem", color: mutedText, display: "flex", alignItems: "center", gap: "4px" }}>
              {isEditedState && <span style={{ fontStyle: "italic", opacity: 0.8 }}>(edited)</span>}
              {timeAgo}
            </span>
          </div>

          {isEditing ? (
            <div style={{ marginTop: "8px" }}>
              <textarea 
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ width: "100%", backgroundColor: "transparent", border: `1px solid ${borderColor}`, color: textColor, padding: "8px", borderRadius: "8px", outline: "none", fontSize: isMobile ? "0.8rem" : "0.85rem", minHeight: "60px", resize: "vertical", fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                <button onClick={() => { setIsEditing(false); setEditContent(currentContent); }} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "transparent", border: `1px solid ${borderColor}`, color: textColor, borderRadius: "16px", fontSize: "0.75rem", cursor: "pointer" }}>
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleEditSubmit} disabled={isSubmittingEdit || !editContent.trim()} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", backgroundColor: accentColor, color: "#fff", border: "none", borderRadius: "16px", fontSize: "0.75rem", cursor: editContent.trim() ? "pointer" : "not-allowed", opacity: isSubmittingEdit ? 0.7 : 1 }}>
                  {isSubmittingEdit ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: isMobile ? "0.8rem" : "0.85rem", color: textColor, marginTop: "4px", lineHeight: "1.5", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              {currentContent}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "16px", marginTop: "6px", marginLeft: "4px", fontSize: isMobile ? "0.7rem" : "0.75rem", fontWeight: 600, flexWrap: "wrap" }}>
          <button onClick={handleToggleLike} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: isLiked ? accentColor : mutedText, padding: 0 }}>
            <Heart size={isMobile ? 12 : 14} fill={isLiked ? accentColor : "none"} /> 
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {depth < MAX_DEPTH && (
            <button onClick={() => setIsReplying(!isReplying)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: mutedText, padding: 0 }}>
              <MessageSquare size={isMobile ? 12 : 14} /> Reply
            </button>
          )}

          {isOwner && !isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: mutedText, padding: 0 }}>
                <Pencil size={isMobile ? 12 : 14} /> Edit
              </button>
              
              <button onClick={handleDeleteSelf} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}>
                <Trash2 size={isMobile ? 12 : 14} /> Delete
              </button>
            </>
          )}
        </div>

        {/* Reply Input Box */}
        {isReplying && (
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
            <input 
              autoFocus
              placeholder={`Replying to ${comment.author.username}...`}
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if(e.key === 'Enter') handleSubmitReply(); }}
              style={{ flex: 1, backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor, padding: isMobile ? "6px 10px" : "8px 12px", borderRadius: "20px", outline: "none", fontSize: isMobile ? "0.8rem" : "0.85rem" }}
            />
            <button onClick={handleSubmitReply} disabled={!replyText.trim() || isSubmittingReply} style={{ padding: isMobile ? "6px 12px" : "8px 16px", backgroundColor: accentColor, color: "white", borderRadius: "20px", border: "none", fontSize: isMobile ? "0.75rem" : "0.85rem", fontWeight: 600, cursor: replyText.trim() ? "pointer" : "not-allowed", opacity: replyText.trim() ? 1 : 0.5 }}>
              {isSubmittingReply ? <Loader2 size={14} className="animate-spin" /> : "Post"}
            </button>
          </div>
        )}

        {/* Fetch Replies Accordion */}
        {comment.replyCount > 0 && !showReplies && (
          <button onClick={() => handleFetchReplies()} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: accentColor, fontWeight: 600, fontSize: isMobile ? "0.75rem" : "0.8rem", marginTop: "8px", cursor: "pointer", padding: 0 }}>
            <div style={{ width: "24px", height: "1px", backgroundColor: accentColor }} />
            View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {/* Render Children (The Recursive Magic) */}
        {showReplies && replies.length > 0 && (
          <div style={{ marginTop: "4px" }}>
            {replies.map(reply => (
              <CommentThread 
                key={reply.id} 
                comment={reply} 
                postId={postId} 
                depth={depth + 1} 
                onDelete={handleChildDeleted}
              />
            ))}
            
            {nextCursor && (
              <button onClick={() => handleFetchReplies(nextCursor)} disabled={isLoadingReplies} style={{ background: "none", border: "none", color: mutedText, fontSize: isMobile ? "0.75rem" : "0.8rem", marginTop: "8px", cursor: "pointer", fontWeight: 600 }}>
                {isLoadingReplies ? "Loading..." : "Show more replies"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;