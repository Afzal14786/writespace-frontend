import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

import ProfileSidebar from "../../components/home/ProfileSidebar";
import TrendingSidebar from "../../components/home/TrendingSidebar";
import CreatePostEditor from "../../components/home/CreatePostEditor";
import PostComponent from "../../components/home/PostComponent";
import Footer from "../../components/layout/Footer";
import type { Post } from "../../types/api.types";
import { PostsAPI } from "../../api/posts.api"; 

type SortOption = "Recent" | "Top" | "Discussed";
const SORT_OPTIONS: SortOption[] = ["Recent", "Top", "Discussed"];

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [sortBy, setSortBy] = useState<SortOption>("Recent");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  
  // SWR Instant Load: Initialize state directly from localStorage
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const cachedPosts = localStorage.getItem("feedCache");
      return cachedPosts ? JSON.parse(cachedPosts) as Post[] : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(posts.length === 0);

  // INFINITE SCROLL: Cursor State Management
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  // Intersection Observer Setup
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingMore) return;
      
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && cursor !== null) {
          setIsFetchingMore(true); 
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore, cursor]
  );

  const toastTriggered = useRef<boolean>(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Centralized Cursor Fetching Logic
  useEffect(() => {
    let isMounted = true;
    toastTriggered.current = false;

    const fetchFeed = async () => {
      try {
        if (!cursor && posts.length === 0) setIsLoading(true);
        
        const feedResponse = await PostsAPI.getPosts(cursor ? { cursor } : undefined);
        
        if (isMounted) {
          const newPosts = feedResponse.posts || [];
          const nextCursor = feedResponse.pagination.nextCursor;

          setHasMore(nextCursor !== null);

          if (!cursor) {
            setPosts(newPosts);
            if (sortBy === "Recent") {
              localStorage.setItem("feedCache", JSON.stringify(newPosts.slice(0, 15)));
            }
          } else {
            setPosts((prevPosts) => {
              const existingIds = new Set(prevPosts.map(p => p.id));
              const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
              return [...prevPosts, ...uniqueNewPosts];
            });
          }
          
          if (nextCursor !== cursor) {
             setCursor(nextCursor);
          }
        }
      } catch (error: unknown) {
        if (isMounted) {
          console.error("Error fetching live feed:", error);
          if (!toastTriggered.current) {
            toast.error("Failed to load feed. Check your connection.");
            toastTriggered.current = true;
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    if (!cursor || isFetchingMore) {
      fetchFeed();
    }

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, isFetchingMore]); 

  const handleSortChange = (newSort: SortOption) => {
    if (sortBy === newSort) return; 
    setSortBy(newSort);
    setCursor(null); 
    setHasMore(true);
    setIsFetchingMore(false);
    setIsSortOpen(false);
  };

  const handlePostCreated = (newPost: Post) => {
    if (sortBy === "Recent") {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } else {
      handleSortChange("Recent"); 
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const layoutStyle: React.CSSProperties = {
    maxWidth: "1200px", 
    margin: "0 auto", 
    display: "grid",
    gridTemplateColumns: isMobile 
      ? "minmax(0, 1fr)" 
      : isTablet 
      ? "250px minmax(0, 1fr)" 
      : "225px minmax(0, 1fr) 275px",
    gap: "1rem", 
    alignItems: "start"
  };

  return (
    <div style={{ paddingTop: "72px", paddingLeft: isMobile ? "0.5rem" : "1rem", paddingRight: isMobile ? "0.5rem" : "1rem", paddingBottom: "2rem" }}>
      <div style={layoutStyle}>
        
        {!isMobile && (
          <div style={{ position: "sticky", top: "72px" }}>
            <ProfileSidebar />
          </div>
        )}

        <main style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
          <CreatePostEditor onPostCreated={handlePostCreated} />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 8px", position: "relative" }}>
            <div style={{ height: "1px", backgroundColor: borderColor, flex: 1 }} />
            <div 
              style={{ fontSize: "0.8rem", color: mutedText, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", position: "relative" }}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              Sort by: <strong style={{ color: textColor }}>{sortBy}</strong>
              <ChevronDown size={14} color={mutedText} style={{ transform: isSortOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              
              {isSortOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", width: "140px", backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10, overflow: "hidden" }}>
                  {SORT_OPTIONS.map((option) => (
                    <div 
                      key={option} 
                      onClick={() => handleSortChange(option)}
                      style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", color: textColor, fontWeight: sortBy === option ? 600 : 400, borderBottom: `1px solid ${borderColor}`, cursor: "pointer" }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      {option} {sortBy === option && <Check size={14} color={accentColor} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isLoading ? (
               <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                 <Loader2 size={32} className="animate-spin" style={{ color: accentColor }} />
               </div>
            ) : posts.length > 0 ? (
               <>
                 {posts.map(post => <PostComponent key={post.id} post={post} />)}
                 
                 {isFetchingMore && (
                   <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                     <Loader2 size={24} className="animate-spin" style={{ color: accentColor }} />
                   </div>
                 )}

                 {!isFetchingMore && hasMore && (
                   <div ref={lastPostElementRef} style={{ height: "20px" }} />
                 )}

                 {!hasMore && (
                   <div style={{ textAlign: "center", color: mutedText, padding: "2rem", fontSize: "0.9rem" }}>
                     You're all caught up!
                   </div>
                 )}
               </>
            ) : (
               <div style={{ textAlign: "center", color: mutedText, padding: "2rem", backgroundColor: cardBg, borderRadius: "12px", border: `1px solid ${borderColor}` }}>
                 No posts found. Start writing!
               </div>
            )}
          </div>
        </main>

        {!isMobile && !isTablet && (
          <div style={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <TrendingSidebar />
            <Footer variant="sidebar" />
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;