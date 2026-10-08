import React, { useState } from "react";
import { Shield, Code2, Bell, Monitor, Eye } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { AccountSecurityTab } from "../../components/settings/AccountSecurityTab";
import { IntegrationsTab, NotificationsTab, AppearanceTab, PrivacyTab } from "../../components/settings/OtherSettingsTabs";

type TabId = "account" | "integrations" | "notifications" | "appearance" | "privacy";

const SettingsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<TabId>("account");

  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";

  const tabs = [
    { id: "account", label: "Account & Security", icon: Shield },
    { id: "integrations", label: "Professional Integrations", icon: Code2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Monitor },
    { id: "privacy", label: "Privacy & Visibility", icon: Eye },
  ] as const;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "account": return <AccountSecurityTab />;
      case "integrations": return <IntegrationsTab />;
      case "notifications": return <NotificationsTab />;
      case "appearance": return <AppearanceTab />;
      case "privacy": return <PrivacyTab />;
      default: return <AccountSecurityTab />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bgColor, color: textColor, paddingTop: "80px", paddingBottom: "40px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
        
        {/* Left Sidebar */}
        <div style={{ width: "260px", flexShrink: 0 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "24px" }}>Settings</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", width: "100%",
                    padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                    backgroundColor: isActive ? (isDark ? "#1e293b" : "#e2e8f0") : "transparent",
                    color: isActive ? (isDark ? "#fff" : "#000") : (isDark ? "#94a3b8" : "#64748b"),
                    fontWeight: isActive ? 600 : 500, fontSize: "0.95rem", textAlign: "left",
                    transition: "background-color 0.2s, color 0.2s"
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Icon size={18} color={isActive ? "#6366f1" : "currentColor"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          {renderActiveTab()}
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;