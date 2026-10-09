import React from "react";
import Header from "./Header";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Outlet } from "react-router-dom";

const PublicProfileLayout: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          paddingTop: "64px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default PublicProfileLayout;