import React from "react";
import { Activity, Users, Eye, Heart, Tag, type LucideIcon } from "lucide-react";
import type { User } from "../../types/api.types";
import { useTheme } from "../../context/ThemeContext";

interface ProfileAnalyticsProps {
  profileUser: User;
  followerCount: number;
}

interface StatRowProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  borderColor: string;
  mutedText: string;
  textColor: string;
  isLast?: boolean;
}

// 🔥 FIX: Replaced square boxes with a sleek vertical list sequence
const StatRow: React.FC<StatRowProps> = ({ icon: Icon, value, label, borderColor, mutedText, textColor, isLast = false }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: isLast ? "none" : `1px solid ${borderColor}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: mutedText }}>
      <Icon size={18} />
      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{label}</span>
    </div>
    <span style={{ fontSize: "1rem", fontWeight: 800, color: textColor }}>{value}</span>
  </div>
);

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ profileUser, followerCount }) => {
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const tagBg = isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff";
  const accentColor = "#6366f1";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Analytics Sequence Card */}
      <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "20px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor, display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={18} /> Activity Overview
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column" }}>
          <StatRow icon={Users} value={followerCount} label="Followers" borderColor={borderColor} mutedText={mutedText} textColor={textColor} />
          <StatRow icon={Users} value={profileUser.totalFollowing || 0} label="Following" borderColor={borderColor} mutedText={mutedText} textColor={textColor} />
          <StatRow icon={Eye} value={profileUser.totalReads || 0} label="Total Views" borderColor={borderColor} mutedText={mutedText} textColor={textColor} />
          <StatRow icon={Heart} value={"--"} label="Total Likes" borderColor={borderColor} mutedText={mutedText} textColor={textColor} isLast={true} />
        </div>
      </div>

      {/* Top Tags Widget (Future) */}
      <div style={{ backgroundColor: cardBg, borderRadius: "16px", border: `1px solid ${borderColor}`, padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 700, color: textColor, display: "flex", alignItems: "center", gap: "8px" }}>
          <Tag size={18} /> Top Tags
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["react", "typescript", "frontend"].map((tag) => (
            <span key={tag} style={{ color: accentColor, backgroundColor: tagBg, padding: "6px 12px", borderRadius: "16px", fontSize: "0.85rem", fontWeight: 600 }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProfileAnalytics;