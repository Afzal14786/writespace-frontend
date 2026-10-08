import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { PostsAPI } from "../../api/posts.api";
import PostComponent from "../../components/home/PostComponent";
import { useTheme } from "../../context/ThemeContext";

import type { Post } from "../../types/api.types";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";

  useEffect(() => {
    if (!postId) return;

    let isMounted = true;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await PostsAPI.getPostById(postId);
        if (isMounted) {
          setPost(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch post:", err);
        if (isMounted) {
          const apiError = err as ApiErrorResponse;
          const errorMessage = 
            apiError.response?.data?.message || 
            (err instanceof Error ? err.message : "Post not found or has been deleted.");
            
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: bgColor, 
        color: textColor,
        paddingTop: "64px", 
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div 
        style={{ 
          width: "100%", 
          maxWidth: "680px", 
          borderLeft: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          minHeight: "calc(100vh - 64px)",
          backgroundColor: isDark ? "#0f172a" : "#ffffff"
        }}
      >
        {/* Sticky Back Navigation Header */}
        <div 
          style={{ 
            position: "sticky", 
            top: "64px", 
            zIndex: 10,
            display: "flex", 
            alignItems: "center", 
            gap: "16px", 
            padding: "12px 16px",
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${borderColor}`,
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onClick={() => navigate(-1)} 
        >
          <div 
            style={{
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <ArrowLeft size={20} color={textColor} />
          </div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Post</h2>
        </div>

        {/* Content Area */}
        <div style={{ padding: "16px 0" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <Loader2 className="animate-spin" size={32} color="#6366f1" />
            </div>
          ) : error ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center", color: isDark ? "#94a3b8" : "#64748b" }}>
              <AlertCircle size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
              <h3 style={{ margin: "0 0 8px 0", color: textColor }}>Post unavailable</h3>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : post ? (
            <div style={{ padding: "0 16px" }}>
               <PostComponent post={post} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;