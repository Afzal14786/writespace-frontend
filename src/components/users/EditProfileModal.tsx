import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, User as UserIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import type { User } from "../../types/api.types";
import { useTheme } from "../../context/ThemeContext";
import { UsersAPI, type UpdateProfilePayload } from "../../api/users.api";
import { toast } from "react-toastify";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<User>) => void;
}

type TabId = "basic" | "socials" | "images";

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
  profileImage: File | undefined;
  bannerImage: File | undefined;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bgOverlay = "rgba(0, 0, 0, 0.6)";
  const modalBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [isSaving, setIsSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
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

  const [previews, setPreviews] = useState<{ profile: string | null; banner: string | null }>({
    profile: user.profileImageUrl || null,
    banner: user.bannerImageUrl || null,
  });

  useEffect(() => {
    return () => {
      if (files.profileImage && previews.profile) URL.revokeObjectURL(previews.profile);
      if (files.bannerImage && previews.banner) URL.revokeObjectURL(previews.banner);
    };
  }, [files, previews.profile, previews.banner]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof FileState) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles({ ...files, [type]: file });

      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [type === "profileImage" ? "profile" : "banner"]: previewUrl,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sanitizedSocialLinks = Object.entries(socialLinks).reduce((acc, [key, value]) => {
        const trimmed = value.trim();
        if (trimmed !== "") {
          const finalUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
          acc[key as keyof SocialLinksState] = finalUrl;
        }
        return acc;
      }, {} as Partial<SocialLinksState>);

      const payload: UpdateProfilePayload = {
        personal_info: personalInfo,
        social_links: sanitizedSocialLinks,
        profileImage: files.profileImage,
        bannerImage: files.bannerImage,
      };

      const updatedUser = await UsersAPI.updateProfile(user.id, payload);
      
      toast.success("Profile updated successfully!");
      onUpdate(updatedUser); 
      onClose(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile. Please verify your data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: bgOverlay, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ backgroundColor: modalBg, borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${borderColor}` }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: textColor, fontWeight: 700 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: mutedText, cursor: "pointer", display: "flex", padding: "4px" }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${borderColor}`, padding: "0 24px" }}>
          {[
            { id: "basic", label: "Basic Info", icon: UserIcon },
            { id: "socials", label: "Social Links", icon: LinkIcon },
            { id: "images", label: "Images", icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              style={{
                flex: 1, padding: "16px 0", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s",
                border: "none", borderBottom: activeTab === tab.id ? `3px solid ${accentColor}` : "3px solid transparent",
                color: activeTab === tab.id ? accentColor : mutedText
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          
          {activeTab === "basic" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: textColor }}>Full Name</label>
                <input name="fullname" value={personalInfo.fullname} onChange={handlePersonalChange} type="text" placeholder="John Doe" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: textColor }}>Headline</label>
                <input name="headline" value={personalInfo.headline} onChange={handlePersonalChange} type="text" placeholder="Frontend Developer at XYZ" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: textColor }}>Location</label>
                <input name="location" value={personalInfo.location} onChange={handlePersonalChange} type="text" placeholder="Dubai, UAE" style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: textColor }}>Bio</label>
                <textarea name="bio" value={personalInfo.bio} onChange={handlePersonalChange} rows={4} placeholder="Tell us about yourself..." style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, outline: "none", resize: "vertical" }} />
              </div>
            </>
          )}

          {activeTab === "socials" && (
            <>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: mutedText }}>Enter your profile URLs (e.g. twitter.com/username)</p>
              {(Object.keys(socialLinks) as Array<keyof SocialLinksState>).map((key) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: textColor, textTransform: "capitalize" }}>{key}</label>
                  <input name={key} value={socialLinks[key]} onChange={handleSocialChange} type="text" placeholder={`${key}.com/yourusername`} style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, outline: "none" }} />
                </div>
              ))}
            </>
          )}

          {activeTab === "images" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "16px", borderBottom: `1px solid ${borderColor}` }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Profile Avatar</label>
                <p style={{ margin: "0", fontSize: "0.8rem", color: mutedText }}>Upload a square image (JPG, PNG).</p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
                  {previews.profile && (
                    <img src={previews.profile} alt="Avatar Preview" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${borderColor}` }} />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profileImage")} style={{ color: textColor, flex: 1 }} />
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: textColor }}>Profile Banner</label>
                <p style={{ margin: "0", fontSize: "0.8rem", color: mutedText }}>Upload a wide landscape image (JPG, PNG).</p>
                {previews.banner && (
                  <img src={previews.banner} alt="Banner Preview" style={{ width: "100%", height: "100px", borderRadius: "8px", objectFit: "cover", border: `1px solid ${borderColor}`, marginTop: "8px" }} />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "bannerImage")} style={{ marginTop: "8px", color: textColor }} />
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "20px 24px", borderTop: `1px solid ${borderColor}`, display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: inputBg }}>
          <button onClick={onClose} disabled={isSaving} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "transparent", color: textColor, border: `1px solid ${borderColor}`, fontWeight: 600, cursor: isSaving ? "not-allowed" : "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: accentColor, color: "#fff", border: "none", fontWeight: 600, cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            {isSaving ? <><Loader2 size={16} className="lucide-spin" /> Saving...</> : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;