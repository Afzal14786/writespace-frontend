import React, { useState } from "react";
import { FileText, Grid, BarChart2, Compass } from "lucide-react";
import type { User, Post } from "../../types/api.types";
import PostComponent from "../home/PostComponent";
import { useTheme } from "../../context/ThemeContext";

interface ProfileContentProps {
  posts: Post[];
  profileUser: User;
  isFollowing: boolean;
}

type TabId = "posts" | "articles" | "dashboard";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "articles", label: "Articles", icon: Grid },
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
];

const ProfileContent: React.FC<ProfileContentProps> = ({ posts, profileUser, isFollowing }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("posts");

  // Derive theme colors locally
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ backgroundColor: cardBg, borderRadius: "12px", border: `1px solid ${borderColor}`, display: "flex", padding: "4px", gap: "4px" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "12px", border: "none", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              backgroundColor: activeTab === tab.id ? (isDark ? "#334155" : "#f1f5f9") : "transparent",
              color: activeTab === tab.id ? textColor : mutedText
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
          {posts.length > 0 ? (
            posts.map((post) => {
              const postAuthor = {
                id: profileUser.id,
                username: profileUser.username,
                fullname: profileUser.fullname,
                profileImageUrl: profileUser.profileImageUrl || null,
                isFollowingByMe: isFollowing,
              };

              const hydratedPost: Post = {
                ...post,
                author: postAuthor,
              };

              return (
                 <div key={post.id} style={{ width: "100%", overflow: "hidden" }}>
                    <PostComponent post={hydratedPost} />
                 </div>
              );
            })
          ) : (
            <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "60px 20px", textAlign: "center", color: mutedText }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: "16px", margin: "0 auto" }} />
              <p style={{ margin: 0, fontSize: "1rem" }}>No posts published yet.</p>
            </div>
          )}
        </div>
      )}

      {(activeTab === "articles" || activeTab === "dashboard") && (
        <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "80px 20px", textAlign: "center", color: mutedText, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Compass size={64} style={{ opacity: 0.2, marginBottom: "24px" }} />
          <h2 style={{ fontSize: "1.25rem", color: textColor, margin: "0 0 8px 0" }}>Feature Coming Soon</h2>
          <p style={{ margin: 0, maxWidth: "400px", lineHeight: "1.5" }}>
            We are currently building the {activeTab} engine to give you deeper tools and insights. Stay tuned!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;