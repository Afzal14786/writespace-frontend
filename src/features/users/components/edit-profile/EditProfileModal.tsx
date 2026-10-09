import React, { useEffect, useState } from "react";
import {
  X,
  Image as ImageIcon,
  User as UserIcon,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useUpdateProfile } from "@/features/users/hooks/useUpdateProfile";
import type {
  SocialLinks,
  UpdateProfilePayload,
  User,
} from "@/features/users/types/user.types";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<User>) => void;
}

type TabId = "basic" | "socials" | "images";

interface PersonalInfoState {
  fullname: string;
  headline: string;
  bio: string;
  location: string;
}

interface SocialLinksState {
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  facebook: string;
  leetcode: string;
  codeforces: string;
  geeksforgeeks: string;
}

interface FileState {
  profileImage?: File;
  bannerImage?: File;
}

interface PreviewState {
  profile: string | null;
  banner: string | null;
}

const SOCIAL_FIELDS: Array<keyof SocialLinksState> = [
  "website",
  "github",
  "twitter",
  "linkedin",
  "instagram",
  "youtube",
  "facebook",
  "leetcode",
  "codeforces",
  "geeksforgeeks",
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { updateProfile, loading } = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<TabId>("basic");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>({
    fullname: user.fullname || "",
    headline: user.headline || "",
    bio: user.bio || "",
    location: user.location || "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinksState>({
    website: user.website || "",
    github: user.github || "",
    twitter: user.twitter || "",
    linkedin: user.linkedin || "",
    instagram: user.instagram || "",
    youtube: user.youtube || "",
    facebook: user.facebook || "",
    leetcode: user.leetcode || "",
    codeforces: user.codeforces || "",
    geeksforgeeks: user.geeksforgeeks || "",
  });

  const [files, setFiles] = useState<FileState>({
    profileImage: undefined,
    bannerImage: undefined,
  });

  const [previews, setPreviews] = useState<PreviewState>({
    profile: user.profileImageUrl || null,
    banner: user.bannerImageUrl || null,
  });

  const bgOverlay = "rgba(0, 0, 0, 0.6)";
  const modalBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const borderColor = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.1)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  useEffect(() => {
    return () => {
      if (previews.profile?.startsWith("blob:")) {
        URL.revokeObjectURL(previews.profile);
      }

      if (previews.banner?.startsWith("blob:")) {
        URL.revokeObjectURL(previews.banner);
      }
    };
  }, [previews.profile, previews.banner]);

  const handlePersonalChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setPersonalInfo((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSocialChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setSocialLinks((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: keyof FileState,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFiles((previous) => ({
      ...previous,
      [type]: file,
    }));

    setPreviews((previous) => ({
      ...previous,
      [type === "profileImage" ? "profile" : "banner"]: previewUrl,
    }));
  };

  const normalizeSocialUrl = (value: string): string => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const buildSocialLinks = (): SocialLinks => {
    const result: SocialLinks = {};

    for (const field of SOCIAL_FIELDS) {
      result[field] = normalizeSocialUrl(socialLinks[field]);
    }

    return result;
  };

  const validatePersonalInfo = (): boolean => {
    const fullname = personalInfo.fullname.trim();
    const headline = personalInfo.headline.trim();
    const location = personalInfo.location.trim();
    const bio = personalInfo.bio.trim();

    if (fullname.length < 3) {
      toast.error("Full name must be at least 3 characters.");
      setActiveTab("basic");
      return false;
    }

    if (headline.length > 200) {
      toast.error("Headline cannot exceed 200 characters.");
      setActiveTab("basic");
      return false;
    }

    if (location.length > 100) {
      toast.error("Location cannot exceed 100 characters.");
      setActiveTab("basic");
      return false;
    }

    if (bio.length > 500) {
      toast.error("Bio cannot exceed 500 characters.");
      setActiveTab("basic");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (loading) {
      return;
    }

    if (!validatePersonalInfo()) {
      return;
    }

    try {
      const payload: UpdateProfilePayload = {
        personal_info: {
          fullname: personalInfo.fullname.trim(),
          headline: personalInfo.headline.trim(),
          location: personalInfo.location.trim(),
          bio: personalInfo.bio.trim(),
        },
        social_links: buildSocialLinks(),
        profileImage: files.profileImage,
        bannerImage: files.bannerImage,
      };

      const updatedUser = await updateProfile(user.id, payload);

      toast.success("Profile updated successfully.");

      onUpdate(updatedUser);
      onClose();
    } catch (error: unknown) {
      console.error("Profile update failed:", error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message =
        apiError.response?.data?.message ||
        "Failed to update profile. Please verify your data.";

      toast.error(message);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${borderColor}`,
    backgroundColor: inputBg,
    color: textColor,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const fieldContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: textColor,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: bgOverlay,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: modalBg,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.25rem",
              color: textColor,
              fontWeight: 700,
            }}
          >
            Edit Profile
          </h2>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "transparent",
              border: "none",
              color: mutedText,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              padding: "4px",
            }}
            aria-label="Close edit profile"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${borderColor}`,
            padding: "0 24px",
          }}
        >
          {[
            { id: "basic", label: "Basic Info", icon: UserIcon },
            { id: "socials", label: "Social Links", icon: LinkIcon },
            { id: "images", label: "Images", icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              disabled={loading}
              style={{
                flex: 1,
                padding: "16px 0",
                background: "transparent",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "all 0.2s",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? `3px solid ${accentColor}`
                    : "3px solid transparent",
                color:
                  activeTab === tab.id ? accentColor : mutedText,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
          }}
        >
          {/* Basic information */}
          {activeTab === "basic" && (
            <>
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>Full Name</label>

                <input
                  name="fullname"
                  value={personalInfo.fullname}
                  onChange={handlePersonalChange}
                  type="text"
                  maxLength={100}
                  placeholder="John Doe"
                  style={inputStyle}
                />

                <small style={{ color: mutedText }}>
                  Minimum 3 characters.
                </small>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>Headline</label>

                <input
                  name="headline"
                  value={personalInfo.headline}
                  onChange={handlePersonalChange}
                  type="text"
                  maxLength={200}
                  placeholder="Frontend Developer at XYZ"
                  style={inputStyle}
                />

                <small style={{ color: mutedText }}>
                  {personalInfo.headline.length}/200
                </small>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>Location</label>

                <input
                  name="location"
                  value={personalInfo.location}
                  onChange={handlePersonalChange}
                  type="text"
                  maxLength={100}
                  placeholder="Dubai, UAE"
                  style={inputStyle}
                />

                <small style={{ color: mutedText }}>
                  {personalInfo.location.length}/100
                </small>
              </div>

              <div style={fieldContainerStyle}>
                <label style={labelStyle}>Bio</label>

                <textarea
                  name="bio"
                  value={personalInfo.bio}
                  onChange={handlePersonalChange}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us about yourself..."
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />

                <small style={{ color: mutedText }}>
                  {personalInfo.bio.length}/500
                </small>
              </div>
            </>
          )}

          {/* Social links */}
          {activeTab === "socials" && (
            <>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "0.85rem",
                  color: mutedText,
                }}
              >
                Enter your profile URLs. For example:
                https://github.com/username
              </p>

              {SOCIAL_FIELDS.map((key) => (
                <div
                  key={key}
                  style={fieldContainerStyle}
                >
                  <label
                    style={{
                      ...labelStyle,
                      textTransform: "capitalize",
                    }}
                  >
                    {key}
                  </label>

                  <input
                    name={key}
                    value={socialLinks[key]}
                    onChange={handleSocialChange}
                    type="text"
                    placeholder={`${key}.com/yourusername`}
                    style={inputStyle}
                  />
                </div>
              ))}
            </>
          )}

          {/* Images */}
          {activeTab === "images" && (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingBottom: "16px",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: textColor,
                  }}
                >
                  Profile Avatar
                </label>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    color: mutedText,
                  }}
                >
                  Upload a square image (JPG, PNG).
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginTop: "8px",
                  }}
                >
                  {previews.profile && (
                    <img
                      src={previews.profile}
                      alt="Avatar Preview"
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid ${borderColor}`,
                      }}
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleFileChange(event, "profileImage")
                    }
                    disabled={loading}
                    style={{
                      color: textColor,
                      flex: 1,
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingTop: "8px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: textColor,
                  }}
                >
                  Profile Banner
                </label>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    color: mutedText,
                  }}
                >
                  Upload a wide landscape image (JPG, PNG).
                </p>

                {previews.banner && (
                  <img
                    src={previews.banner}
                    alt="Banner Preview"
                    style={{
                      width: "100%",
                      height: "100px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: `1px solid ${borderColor}`,
                      marginTop: "8px",
                    }}
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleFileChange(event, "bannerImage")
                  }
                  disabled={loading}
                  style={{
                    marginTop: "8px",
                    color: textColor,
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: `1px solid ${borderColor}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            backgroundColor: inputBg,
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: textColor,
              border: `1px solid ${borderColor}`,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              backgroundColor: accentColor,
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="lucide-spin"
                />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
