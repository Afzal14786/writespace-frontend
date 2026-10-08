import React, { useState, useEffect, useCallback } from "react";
import { User, Send, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import type { CommentData } from "../../types/api.types";
import { InteractionsAPI } from "../../api/interactions.api";
import CommentThread from "./CommentThread";

interface CommentSectionProps {
  postId: string;
  postAuthorUsername: string; // Left here if you want to pass it down to threads later for author badging
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  // Top-Level State
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  // Input State
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Responsive logic
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 480;

  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";
  const inputBg = isDark ? "rgba(0,0,0,0.3)" : "#f3f4f6";

  const fetchTopLevelComments = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await InteractionsAPI.getTopLevelComments(postId, cursor); 
      
      if (cursor) {
        setComments(prev => [...prev, ...response.comments]);
      } else {
        setComments(response.comments);
      }
      
      setNextCursor(response.nextCursor);
    } catch (error: unknown) {
      console.error("Failed to fetch comments", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchTopLevelComments();
  }, [fetchTopLevelComments]);

  const handleAddTopLevelComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newComment = await InteractionsAPI.addComment(postId, commentText);
      // Optimistically inject the fully hydrated comment at the top of the feed
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopLevelDelete = (deletedCommentId: string) => {
    setComments(prev => prev.filter(c => c.id !== deletedCommentId));
  };

  return (
    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${borderColor}` }}>
      
      <div style={{ display: "flex", gap: isMobile ? "8px" : "10px", alignItems: "center" }}>
        <div style={{ width: isMobile ? "32px" : "36px", height: isMobile ? "32px" : "36px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {authUser?.profileImageUrl ? (
            <img src={authUser.profileImageUrl} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <User size={isMobile ? 16 : 18} color={mutedText} />
          )}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", backgroundColor: inputBg, borderRadius: "24px", padding: isMobile ? "2px 10px" : "4px 12px", border: `1px solid ${borderColor}` }}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={commentText} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)} 
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if(e.key === 'Enter') handleAddTopLevelComment(); }} 
            style={{ flex: 1, background: "transparent", border: "none", color: textColor, padding: "8px", outline: "none", fontSize: isMobile ? "0.8rem" : "0.85rem" }} 
          />
          <button onClick={handleAddTopLevelComment} disabled={!commentText.trim() || isSubmitting} style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", opacity: commentText.trim() ? 1 : 0.5 }}>
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Loader2 size={24} className="animate-spin" color={accentColor} />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: mutedText, fontSize: "0.85rem" }}>
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentThread 
                key={comment.id} 
                comment={comment} 
                postId={postId} 
                onDelete={handleTopLevelDelete}
              />
            ))}
            
            {/* Pagination Load More Button */}
            {nextCursor && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                <button 
                  onClick={() => fetchTopLevelComments(nextCursor)} 
                  disabled={isLoadingMore}
                  style={{ background: "transparent", border: `1px solid ${borderColor}`, color: textColor, padding: "8px 16px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {isLoadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : "Load more comments"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;