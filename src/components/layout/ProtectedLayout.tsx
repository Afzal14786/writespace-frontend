import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // Added theme context
import { Loader2 } from "lucide-react";
import Header from "./Header";

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { theme } = useTheme(); // Consume the current theme

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";

  if (isLoadingAuth) {
    return (
      <div style={{ 
        display: "flex", justifyContent: "center", alignItems: "center", 
        height: "100vh", backgroundColor: bgColor, color: textColor,
        transition: "background-color 0.3s ease, color 0.3s ease" // Smooth transition
      }}>
        <Loader2 size={40} color="#6366f1" className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ 
      display: "flex", flexDirection: "column", minHeight: "100vh", 
      backgroundColor: bgColor, color: textColor,
      transition: "background-color 0.3s ease, color 0.3s ease" // Smooth transition
    }}>
      <Header />
      <main style={{ flex: 1, paddingTop: "64px", display: "flex", flexDirection: "column" }}> 
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;