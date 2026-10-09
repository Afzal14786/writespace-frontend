import React, { useState } from "react";
import {
  Key,
  Mail,
  Smartphone,
  Shield,
  AlertTriangle,
  Trash2,
  Download,
  Loader2,
  Github,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";

import { AuthAPI } from "@/features/auth/api/auth.api";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { useDeleteUser } from "@/features/users/hooks/useDeleteUser";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const AccountSecurityTab: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const isDark = theme === "dark";

  /*
   * Delete/Suspend Account
   */
  const { deleteUser, loading: isDeletingAccount } = useDeleteUser();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  /*
   * Password Input States
   */
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  /*
   * Temporary UI for backend features that are
   * not implemented yet.
   *
   * We are keeping these because their backend
   * functionality is not currently part of the
   * Users/Auth integration we are implementing.
   */
  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} feature coming in v1.1!`, {
      theme: isDark ? "dark" : "light",
    });
  };

  /*
   * Update Password
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match", {
        theme: isDark ? "dark" : "light",
      });

      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters", {
        theme: isDark ? "dark" : "light",
      });

      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.updatePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully! Other sessions revoked.", {
        theme: isDark ? "dark" : "light",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;

      toast.error(
        apiError.response?.data?.message || "Failed to update password",
        {
          theme: isDark ? "dark" : "light",
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Delete / Suspend Account
   *
   * Backend endpoint:
   *
   * DELETE /users/:id
   *
   * The backend performs a soft suspension.
   */
  const handleDeleteAccount = async () => {
    if (!user?.id || isDeletingAccount) {
      return;
    }

    try {
      await deleteUser(user.id);

      toast.success("Your account has been deactivated.", {
        theme: isDark ? "dark" : "light",
      });

      setIsDeleteConfirmOpen(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;

      console.error("Failed to deactivate account:", err);

      toast.error(
        apiError.response?.data?.message ||
          "Failed to deactivate your account.",
        {
          theme: isDark ? "dark" : "light",
        },
      );
    }
  };

  /*
   * Styles
   */
  const sectionStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#1e293b" : "#ffffff",

    border: `1px solid ${
      isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
    }`,

    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  };

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    paddingRight: "40px",
    borderRadius: "8px",
    marginTop: "6px",

    backgroundColor: isDark ? "#0f172a" : "#f8fafc",

    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,

    color: isDark ? "#f1f5f9" : "#0f172a",

    outline: "none",
    fontSize: "0.95rem",
  };

  const btnStyle: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    backgroundColor: "#6366f1",
    color: "white",
    transition: "opacity 0.2s",
  };

  const iconBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    marginTop: "3px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,

    color: isDark ? "#94a3b8" : "#64748b",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        animation: "fadeIn 0.3s",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "24px",
          color: isDark ? "#fff" : "#0f172a",
        }}
      >
        Account & Security
      </h2>

      {/* Email Management */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <Mail color="#6366f1" />

          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            Email Address
          </h3>
        </div>

        <p
          style={{
            fontSize: "0.9rem",
            color: isDark ? "#94a3b8" : "#64748b",
            marginBottom: "16px",
          }}
        >
          Your primary email is <strong>{user?.email}</strong>.
        </p>

        <button
          type="button"
          onClick={() => handleComingSoon("Change Email")}
          style={{
            ...btnStyle,
            backgroundColor: isDark ? "#334155" : "#e2e8f0",
            color: isDark ? "#f1f5f9" : "#0f172a",
          }}
        >
          Change Email Address
        </button>
      </div>

      {/* Password Management */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <Key color="#10b981" />

          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            Update Password
          </h3>
        </div>

        <form
          onSubmit={handleUpdatePassword}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Current Password */}
          <div>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Current Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputBaseStyle}
                required
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={iconBtnStyle}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* New Password */}
            <div
              style={{
                flex: "1 1 200px",
              }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                New Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputBaseStyle}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={iconBtnStyle}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div
              style={{
                flex: "1 1 200px",
              }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Confirm New Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputBaseStyle}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={iconBtnStyle}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...btnStyle,
              alignSelf: "flex-start",
              opacity: isLoading ? 0.7 : 1,
              marginTop: "8px",
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>

      {/* Security & Sessions */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <Shield color="#8b5cf6" />

          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            Security
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Connected Accounts */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "16px",
              borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                Connected Accounts
              </p>

              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.85rem",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                Manage OAuth providers
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleComingSoon("OAuth Management")}
              style={{
                ...btnStyle,
                backgroundColor: "transparent",
                border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                color: isDark ? "#fff" : "#000",
              }}
            >
              <Github size={16} />
              Connect
            </button>
          </div>

          {/* Active Sessions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Smartphone size={24} color={isDark ? "#94a3b8" : "#64748b"} />

              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Active Sessions
                </p>

                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "0.85rem",
                    color: isDark ? "#94a3b8" : "#64748b",
                  }}
                >
                  MacBook Pro - Mumbai, India (Current)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleComingSoon("Session Revocation")}
              style={{
                ...btnStyle,
                backgroundColor: "#ef4444",
              }}
            >
              Revoke All
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          ...sectionStyle,
          border: "1px solid #ef4444",
          backgroundColor: isDark
            ? "rgba(239, 68, 68, 0.05)"
            : "rgba(239, 68, 68, 0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <AlertTriangle color="#ef4444" />

          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#ef4444",
            }}
          >
            Danger Zone
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Export Data */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Export My Data
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                Download a JSON archive of your content.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleComingSoon("Data Export")}
              style={{
                ...btnStyle,
                backgroundColor: isDark ? "#334155" : "#e2e8f0",
                color: isDark ? "#fff" : "#000",
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {/* Delete Account */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "#ef4444",
                }}
              >
                Delete Account
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                Deactivate your WriteSpace account and sign out from this
                account.
              </p>
            </div>

            <button
              type="button"
              disabled={isDeletingAccount}
              onClick={() => setIsDeleteConfirmOpen(true)}
              style={{
                ...btnStyle,
                backgroundColor: "#ef4444",
                opacity: isDeletingAccount ? 0.7 : 1,
                cursor: isDeletingAccount ? "not-allowed" : "pointer",
              }}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <AlertTriangle size={24} color="#ef4444" />

              <h3
                id="delete-account-title"
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: isDark ? "#f8fafc" : "#0f172a",
                }}
              >
                Deactivate your account?
              </h3>
            </div>

            <p
              style={{
                margin: "0 0 12px",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: isDark ? "#cbd5e1" : "#475569",
              }}
            >
              Your WriteSpace account will be suspended and you will be signed
              out.
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                lineHeight: 1.6,
                fontWeight: 600,
                color: "#ef4444",
              }}
            >
              Are you sure you want to continue?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setIsDeleteConfirmOpen(false)}
                style={{
                  ...btnStyle,
                  backgroundColor: isDark ? "#334155" : "#e2e8f0",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => void handleDeleteAccount()}
                style={{
                  ...btnStyle,
                  backgroundColor: "#ef4444",
                  opacity: isDeletingAccount ? 0.7 : 1,
                  cursor: isDeletingAccount ? "not-allowed" : "pointer",
                }}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Yes, Deactivate Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
