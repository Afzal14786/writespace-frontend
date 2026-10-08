import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, FileCode2, Terminal } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubLight } from "@uiw/codemirror-theme-github";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";
import { useTheme } from "../../context/ThemeContext";

export interface CodeSnippet {
  language: string;
  code: string;
}

interface CodeZenViewerProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: CodeSnippet[];
  title?: string;
}

const CodeZenViewer: React.FC<CodeZenViewerProps> = ({
  isOpen,
  onClose,
  snippets,
  title,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Lock body scroll when the viewer is open.
  // We removed the setActiveIndex(0) from here to prevent the React render warning.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    // Use a tiny timeout to reset the index AFTER the closing animation starts,
    // ensuring we don't trigger cascading renders while it's still mounted.
    setTimeout(() => setActiveIndex(0), 300); 
  };

  if (!isOpen || snippets.length === 0) return null;

  // Safety fallback in case the index somehow goes out of bounds
  const safeIndex = activeIndex < snippets.length ? activeIndex : 0;
  const activeSnippet = snippets[safeIndex];

  const bgMain = isDark ? "#0f172a" : "#f8fafc";
  const bgSidebar = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "python":
        return [python()];
      case "typescript":
      case "javascript":
        return [
          javascript({ typescript: lang.toLowerCase() === "typescript" }),
        ];
      case "java":
        return [java()];
      case "cpp":
        return [cpp()];
      case "rust":
        return [rust()];
      case "go":
        return [go()];
      case "sql":
        return [sql()];
      default:
        return [javascript()];
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
      setCopiedIndex(safeIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          style={{
            width: "100%",
            maxWidth: "1100px",
            height: "85vh",
            backgroundColor: bgMain,
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              backgroundColor: bgSidebar,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#ff5f56",
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#ffbd2e",
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#27c93f",
                  }}
                />
              </div>
              <span
                style={{
                  fontWeight: 600,
                  color: textColor,
                  fontSize: "0.95rem",
                  marginLeft: "8px",
                }}
              >
                {title ? `CodeZen: ${title}` : "CodeZen Viewer"}
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                color: mutedText,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
                borderRadius: "8px",
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {snippets.length > 1 && (
              <div
                style={{
                  width: "200px",
                  backgroundColor: bgSidebar,
                  borderRight: `1px solid ${borderColor}`,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  overflowY: "auto",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: mutedText,
                    letterSpacing: "0.05em",
                    marginBottom: "8px",
                    paddingLeft: "8px",
                  }}
                >
                  Files
                </span>
                {snippets.map((snippet, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background:
                        safeIndex === idx
                          ? isDark
                            ? "#334155"
                            : "#e2e8f0"
                          : "transparent",
                      border: "none",
                      color: safeIndex === idx ? textColor : mutedText,
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.85rem",
                      fontWeight: safeIndex === idx ? 600 : 500,
                      transition: "all 0.2s",
                    }}
                  >
                    <FileCode2
                      size={16}
                      color={safeIndex === idx ? accentColor : mutedText}
                    />
                    Snippet {idx + 1}{" "}
                    <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                      ({snippet.language})
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "20px",
                  zIndex: 10,
                }}
              >
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {copiedIndex === safeIndex ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copiedIndex === safeIndex ? "Copied!" : "Copy"}
                </button>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "16px 0" }}>
                <CodeMirror
                  value={activeSnippet.code}
                  theme={isDark ? vscodeDark : githubLight}
                  extensions={getLanguageExtension(activeSnippet.language)}
                  editable={false}
                  style={{ fontSize: "0.95rem" }}
                />
              </div>

              <div
                style={{
                  padding: "8px 16px",
                  borderTop: `1px solid ${borderColor}`,
                  backgroundColor: bgSidebar,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: mutedText,
                  fontSize: "0.75rem",
                }}
              >
                <Terminal size={14} /> Read-only mode •{" "}
                {activeSnippet.language.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CodeZenViewer;