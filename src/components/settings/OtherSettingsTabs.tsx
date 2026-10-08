import React from "react";
import { Code2, Briefcase, Bell, Eye, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

// --- REUSABLE SHELL GENERATOR ---
const handleComingSoon = (theme: string) => {
  toast.info("Feature coming in v1.1!", { theme });
};

// 1. Professional Integrations Tab
export const IntegrationsTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div style={{ animation: "fadeIn 0.3s", color: isDark ? "#f1f5f9" : "#0f172a" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Professional Integrations</h2>
      <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}><Code2 color="#3b82f6" /><h3>Coding Profiles</h3></div>
        <p style={{ fontSize: "0.9rem", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "20px" }}>Link your LeetCode, GitHub, and Codeforces handles.</p>
        <button onClick={() => handleComingSoon(isDark ? "dark" : "light")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#6366f1", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Manage Integrations</button>
      </div>
      <div style={{ marginTop: "24px", backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}><Briefcase color="#10b981" /><h3>Resume Upload</h3></div>
        <p style={{ fontSize: "0.9rem", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "20px" }}>Upload your CV for recruiters.</p>
        <button onClick={() => handleComingSoon(isDark ? "dark" : "light")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: isDark ? "#334155" : "#e2e8f0", color: isDark ? "white" : "black", border: "none", cursor: "pointer", fontWeight: 600 }}>Upload PDF</button>
      </div>
    </div>
  );
};

// 2. Notifications Tab
export const NotificationsTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div style={{ animation: "fadeIn 0.3s", color: isDark ? "#f1f5f9" : "#0f172a" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Notification Preferences</h2>
      <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}><Bell color="#f59e0b" /><h3>Push & Email Alerts</h3></div>
        <p style={{ fontSize: "0.9rem", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "20px" }}>Control exactly what interactions notify you.</p>
        <button onClick={() => handleComingSoon(isDark ? "dark" : "light")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#6366f1", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Configure Preferences</button>
      </div>
    </div>
  );
};

// 3. Privacy Tab
export const PrivacyTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div style={{ animation: "fadeIn 0.3s", color: isDark ? "#f1f5f9" : "#0f172a" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Privacy & Visibility</h2>
      <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}><Eye color="#8b5cf6" /><h3>Profile Visibility</h3></div>
        <p style={{ fontSize: "0.9rem", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "20px" }}>Make your profile public or private.</p>
        <button onClick={() => handleComingSoon(isDark ? "dark" : "light")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#6366f1", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Privacy Options</button>
      </div>
    </div>
  );
};

// 4. Appearance Tab (Functional!)
export const AppearanceTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div style={{ animation: "fadeIn 0.3s", color: isDark ? "#f1f5f9" : "#0f172a" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Appearance & UX</h2>
      <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}><Monitor color="#ec4899" /><h3>Theme</h3></div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button 
            onClick={() => { if(!isDark) toggleTheme(); }} 
            style={{ flex: 1, padding: "20px", borderRadius: "8px", border: isDark ? "2px solid #6366f1" : `1px solid #cbd5e1`, backgroundColor: isDark ? "rgba(99,102,241,0.1)" : "transparent", cursor: "pointer", color: isDark ? "#fff" : "#000", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
          >
            <Moon size={24} /> Dark Mode
          </button>
          <button 
            onClick={() => { if(isDark) toggleTheme(); }} 
            style={{ flex: 1, padding: "20px", borderRadius: "8px", border: !isDark ? "2px solid #6366f1" : `1px solid #334155`, backgroundColor: !isDark ? "rgba(99,102,241,0.1)" : "transparent", cursor: "pointer", color: isDark ? "#fff" : "#000", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
          >
            <Sun size={24} /> Light Mode
          </button>
        </div>
      </div>
    </div>
  );
};