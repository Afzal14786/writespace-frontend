import React from "react";
import { TrendingUp, MessageSquare, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

const TrendingSidebar: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";
  const hoverBg = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)";

  const trendingTopics = [
    { tag: "MERN_Stack_2026", posts: "1.2K Discussions" },
    { tag: "System_Design", posts: "830 Responses" },
    { tag: "AI_Engineering", posts: "2.4K Discussions" },
    { tag: "Developer_Log", posts: "112 Responses" },
    { tag: "LeetCode_Daily", posts: "612 Discussions" }
  ];

  const handleComingSoon = () => {
    toast.info("Tranding topics fetures coming soon!", { theme: isDark ? "dark" : "light" });
  };

  return (
    <aside style={{ 
      backgroundColor: cardBg,
      borderRadius: "12px",
      border: `1px solid ${borderColor}`,
      color: textColor,
      boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
      overflow: "hidden"
    }}>
      <div style={{ padding: "16px", borderBottom: `1px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "8px" }}>
        <TrendingUp size={18} color={accentColor} />
        <h3 style={{ fontSize: "1rem", fontWeight: "700", margin: 0, fontFamily: "Inter, sans-serif" }}>
          Trending Topicspace
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {trendingTopics.map((item, idx) => (
          <div 
            key={idx}
            onClick={handleComingSoon}
            style={{
              padding: "12px 16px",
              display: "flex", 
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              borderBottom: idx !== trendingTopics.length - 1 ? `1px solid ${borderColor}` : 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverBg} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ color: mutedText, fontWeight: "600", fontSize: "0.85rem", opacity: 0.7 }}>
                0{idx + 1}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: "600", fontSize: "0.9rem", color: textColor }}>
                  #{item.tag}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: mutedText }}>
                  <MessageSquare size={12} /> {item.posts}
                </span>
              </div>
            </div>
            <ChevronRight size={16} color={mutedText} style={{ opacity: 0.5 }} />
          </div>
        ))}
      </div>
      
      <div 
        onClick={handleComingSoon}
        style={{ padding: "12px 16px", borderTop: `1px solid ${borderColor}`, color: accentColor, fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverBg} 
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        Show more
      </div>
    </aside>
  );
};

export default TrendingSidebar;