import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { UsersAPI } from "../../api/users.api";
import type { User } from "../../types/api.types";

interface SearchComponentProps {
  isMobile?: boolean;
  autoFocus?: boolean;
  onCloseMobile?: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ isMobile, autoFocus, onCloseMobile }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          // This will now strictly return User[] based on your UsersAPI definition
          const results = await UsersAPI.searchUsers(searchQuery);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (username: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (onCloseMobile) onCloseMobile();
    navigate(`/profile/${username}`);
  };

  return (
    <div ref={searchContainerRef} style={{ position: "relative", width: "100%", flex: isMobile ? 1 : "unset" }}>
      
      {/* THE INPUT FIELD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: isMobile ? "0" : "6px 12px",
          width: "100%",
          background: isMobile ? "transparent" : (isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.04)"),
          borderRadius: "4px",
          border: isMobile ? "none" : (isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)"),
          transition: "background-color 0.3s ease",
        }}
      >
        {!isMobile && <Search size={16} color={iconColor} />}
        <input
          autoFocus={autoFocus}
          type="text"
          placeholder="Search Writespace..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.length >= 2) setShowDropdown(true);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: textColor,
            outline: "none",
            width: "100%",
            fontSize: isMobile ? "1rem" : "0.85rem",
          }}
        />
      </div>

      {/* THE DROPDOWN */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "calc(100% + 20px)" : "calc(100% + 8px)",
            left: isMobile ? "-40px" : 0, 
            right: 0,
            width: isMobile ? "calc(100vw - 32px)" : "100%", 
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${borderColor}`,
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 1001,
            maxHeight: "350px",
            overflowY: "auto",
          }}
        >
          {isSearching ? (
            <div style={{ padding: "16px", display: "flex", justifyContent: "center", color: mutedText }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((result: User) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result.username)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: `1px solid ${borderColor}`,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e2e8f0", overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={result.profileImageUrl || `https://ui-avatars.com/api/?name=${result.username}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      alt={result.username}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: textColor, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {result.fullname}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: mutedText }}>@{result.username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "16px", textAlign: "center", color: mutedText, fontSize: "0.85rem" }}>
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;