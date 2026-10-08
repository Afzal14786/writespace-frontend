import React, { useState, useEffect, type KeyboardEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { User, Image as ImageIcon, CodeXml, X, Send, CheckCircle, Loader2, Hash, Bold, Italic, Link as LinkIcon, Save } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { ApiError } from "../../types/ApiError";
import type { Post } from "../../types/api.types";

import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { githubLight } from '@uiw/codemirror-theme-github';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';  
import { rust } from '@codemirror/lang-rust';  
import { go } from '@codemirror/lang-go';  
import { sql } from '@codemirror/lang-sql';  
import { java } from '@codemirror/lang-java';  

import { PostsAPI } from "../../api/posts.api";

interface CreatePostEditorProps { 
  onPostCreated?: (newPost: Post) => void; 
  editPost?: Post; 
  onCloseEdit?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

interface DraftState { 
  title: string;
  content: string; 
  tags: string[]; 
  codeSnippets: { id: string; language: string; code: string }[]; 
}

const CreatePostEditor: React.FC<CreatePostEditorProps> = ({ onPostCreated, editPost, onCloseEdit, onPostUpdated }) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  const isEditMode = !!editPost;

  const [isExpanded, setIsExpanded] = useState<boolean>(isEditMode);
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);
  const [draftStatus, setDraftStatus] = useState<"Saving..." | "Saved" | "">("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [title, setTitle] = useState<string>(editPost?.title || "");
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>(editPost?.media || []);
  
  const initialSnippets = (editPost?.codeSnippets || []).map(s => ({
    id: Math.random().toString(36).substr(2, 9),
    language: s.language,
    code: s.code
  }));
  const [codeSnippets, setCodeSnippets] = useState<{ id: string; language: string; code: string }[]>(initialSnippets);
  
  const [tags, setTags] = useState<string[]>(editPost?.tags || []);
  const [tagInput, setTagInput] = useState<string>("");

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";
  const linkColor = "#3b82f6";
  const inputBg = isDark ? "rgba(0,0,0,0.2)" : "#f8fafc";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { style: `color: ${linkColor}; font-weight: bold; text-decoration: underline; cursor: pointer;` } }),
      Placeholder.configure({ placeholder: 'Share your knowledge, code, or ideas...' }),
    ],
    content: editPost?.content || '', 
    editorProps: { attributes: { class: 'focus:outline-none min-h-[120px]', style: `color: ${textColor}; min-height: 120px; outline: none; font-size: 1rem; line-height: 1.6;` } },
  });

  useEffect(() => {
    if (editor && !isDraftLoaded && !isEditMode) {
      const savedDraft = localStorage.getItem("writespace_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft) as DraftState;
          if (parsed.title) setTitle(parsed.title);
          if (parsed.tags) setTags(parsed.tags);
          if (parsed.codeSnippets) setCodeSnippets(parsed.codeSnippets);
          if (parsed.content) editor.commands.setContent(parsed.content);
          
          if (parsed.title || parsed.content || parsed.tags?.length || parsed.codeSnippets?.length) {
            setDraftStatus("Saved");
          }
        } catch (error: unknown) {
          console.error("Failed to parse draft", error);
        }
      }
      setIsDraftLoaded(true);
    } else if (isEditMode) {
      setIsDraftLoaded(true); 
    }
  }, [editor, isDraftLoaded, isEditMode]);

  useEffect(() => {
    if (!isExpanded || !isDraftLoaded || isEditMode) return; 
    
    const liveHtml = editor?.getHTML() || "";
    const liveText = editor?.getText() || "";

    if (title.trim() || liveText.trim() || codeSnippets.length > 0 || tags.length > 0) {
      setDraftStatus("Saving...");
      const saveTimer = setTimeout(() => {
        localStorage.setItem("writespace_draft", JSON.stringify({ title, content: liveHtml, tags, codeSnippets }));
        setDraftStatus("Saved");
      }, 1000);
      return () => clearTimeout(saveTimer);
    } else {
      localStorage.removeItem("writespace_draft");
      setDraftStatus("");
    }
  }, [title, tags, codeSnippets, isExpanded, isDraftLoaded, isEditMode, editor]);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isExpanded]);

  const resetForm = () => {
    localStorage.removeItem("writespace_draft");
    setTitle("");
    setTags([]);
    setTagInput("");
    
    mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    setMediaFiles([]); 
    setMediaPreviews([]);
    setExistingMedia([]);
    
    setCodeSnippets([]); 
    editor?.commands.setContent(""); 
    setDraftStatus(""); 
    setIsExpanded(false);
  };

  const handleDiscard = () => {
    if (isEditMode) {
      if (onCloseEdit) onCloseEdit();
      return;
    }

    const liveText = editor?.getText() || "";
    if (title.trim() || liveText.trim() || mediaFiles.length > 0 || codeSnippets.length > 0 || tags.length > 0) {
      if (!window.confirm("Discard draft?")) return;
    }
    resetForm();
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput("");
      } else if (tags.length >= 5) {
        toast.warning("Maximum 5 tags allowed.");
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    const finalHtml = editor?.getHTML() || "";
    const finalText = editor?.getText() || "";
    const finalTitle = title.trim();

    if (finalTitle.length < 5) return toast.error("Title must be at least 5 characters.");
    if (finalText.trim().length < 10 && codeSnippets.length === 0 && mediaFiles.length === 0 && existingMedia.length === 0) {
      return toast.error("Content must be at least 10 characters or include media/code.");
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", finalTitle);
      formData.append("content", finalHtml); 
      formData.append("isPublished", "true"); 
      
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      if (codeSnippets.length > 0) {
        const cleanSnippets = codeSnippets.map(({ language, code }) => ({ language, code }));
        formData.append("codeSnippets", JSON.stringify(cleanSnippets));
      }

      if (existingMedia.length > 0) {
        existingMedia.forEach(url => formData.append("existingMedia", url));
      }

      if (mediaFiles.length > 0) {
        mediaFiles.forEach(file => formData.append("media", file)); 
      }

      if (isEditMode && editPost) {
        const updatedPost = await PostsAPI.updatePost(editPost.id, formData);
        toast.success("Post updated successfully!");
        if (onPostUpdated) onPostUpdated(updatedPost);
        if (onCloseEdit) onCloseEdit();
      } else {
        const newPost = await PostsAPI.createPost(formData);
        toast.success("Post published successfully!");
        resetForm();
        if (onPostCreated) onPostCreated(newPost);
      }

    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(axiosError.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'publish'} post.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      if (mediaFiles.length + existingMedia.length + newFiles.length > 4) {
        toast.warning("You can only attach a maximum of 4 images per post.");
        return;
      }

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setMediaFiles(prev => [...prev, ...newFiles]);
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewMedia = (indexToRemove: number) => {
    URL.revokeObjectURL(mediaPreviews[indexToRemove]); 
    setMediaFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setMediaPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeExistingMedia = (indexToRemove: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) { 
      case "python": return [python()]; 
      case "typescript": return [javascript({ typescript: true })]; 
      case "java": return [java()]; 
      case "cpp": return [cpp()];
      case "rust": return [rust()];
      case "go": return [go()];
      case "sql": return [sql()];
      default: return [javascript()]; 
    }
  };

  return (
    <>
      {!isExpanded && !isEditMode && (
        <div style={{ backgroundColor: cardBg, borderRadius: "12px", border: `1px solid ${borderColor}`, padding: "1rem", boxShadow: isDark ? "0 4px 6px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <RouterLink to={`/profile/${authUser?.username}`} style={{ textDecoration: "none" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0, backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" }}>
                {authUser?.profileImageUrl ? <img src={authUser.profileImageUrl} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={20} color={mutedText} />}
              </div>
            </RouterLink>
            <button onClick={() => setIsExpanded(true)} style={{ flex: 1, padding: "10px 16px", borderRadius: "24px", textAlign: "left", border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: mutedText, outline: "none", fontSize: "0.9rem", cursor: "pointer" }}>
              Start a post...
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9990, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "5vh", paddingLeft: "10px", paddingRight: "10px", backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(4px)" }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ backgroundColor: cardBg, borderRadius: "12px", width: "100%", maxWidth: "650px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", overflow: "hidden" }}
            >
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: `1px solid ${borderColor}` }}>
                <RouterLink to={`/profile/${authUser?.username}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {authUser?.profileImageUrl ? <img src={authUser.profileImageUrl} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={18} color={mutedText} />}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: textColor, transition: "text-decoration 0.2s" }} onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}>{authUser?.fullname || "User"}</span>
                      <span style={{ fontSize: "0.7rem", color: isEditMode ? accentColor : (draftStatus === "Saved" ? "#10b981" : mutedText), display: "flex", alignItems: "center", gap: "4px" }}>
                        {isEditMode ? "Editing Post..." : (draftStatus === "Saved" ? <><CheckCircle size={10} />Saved</> : draftStatus || "Draft")}
                      </span>
                    </div>
                  </div>
                </RouterLink>
                <button onClick={handleDiscard} disabled={isSubmitting} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer" }}><X size={22} /></button>
              </div>

              <div style={{ padding: "0", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
                <input 
                  type="text" placeholder="Post Title..." value={title} onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "16px 20px", backgroundColor: "transparent", border: "none", borderBottom: `1px solid ${borderColor}`, color: textColor, outline: "none", fontSize: "1.4rem", fontWeight: 800, fontFamily: "inherit" }}
                />

                <div style={{ padding: "16px 20px" }}>
                  <div style={{ minHeight: "100px", cursor: "text" }} onClick={() => editor?.commands.focus()}>{editor && <EditorContent editor={editor} />}</div>

                  {codeSnippets.map((snippet) => (
                    <div key={snippet.id} style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${borderColor}`, marginTop: "16px", backgroundColor: isDark ? "#0d1117" : "#f8fafc", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: `1px solid ${borderColor}` }}>
                        <div style={{ display: "flex", gap: "6px" }}><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f56' }}/><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }}/><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27c93f' }}/></div>
                        <select value={snippet.language} onChange={(e) => setCodeSnippets(codeSnippets.map(s => s.id === snippet.id ? { ...s, language: e.target.value } : s))} style={{ backgroundColor: "transparent", color: mutedText, border: "none", outline: "none", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                          <option value="python">Python</option><option value="typescript">TypeScript</option><option value="javascript">JavaScript</option><option value="rust">Rust</option><option value="go">Go</option><option value="cpp">C / C++</option><option value="java">Java</option><option value="sql">SQL</option>
                        </select>
                        <button onClick={() => setCodeSnippets(codeSnippets.filter(s => s.id !== snippet.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={14} /></button>
                      </div>
                      <CodeMirror 
                        value={snippet.code} 
                        height="auto" 
                        minHeight="80px" 
                        maxHeight="300px" 
                        theme={isDark ? vscodeDark : githubLight} 
                        extensions={getLanguageExtension(snippet.language)} 
                        onChange={(value) => setCodeSnippets(codeSnippets.map(s => s.id === snippet.id ? { ...s, code: value } : s))} 
                        style={{ fontSize: "0.85rem" }} 
                      />
                    </div>
                  ))}

                  {(existingMedia.length > 0 || mediaPreviews.length > 0) && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px", overflowX: "auto", paddingBottom: "8px" }}>
                      
                      {existingMedia.map((url, idx) => {
                        const imgSrc = url.startsWith('/') ? `http://localhost:8000${url}` : url;
                        return (
                          <div key={`existing-${idx}`} style={{ position: "relative", flexShrink: 0, width: "120px", height: "120px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${borderColor}` }}>
                            <img src={imgSrc} alt="existing media" style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: isDark ? "#000" : "#f1f5f9" }} />
                            <button onClick={() => removeExistingMedia(idx)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={12} /></button>
                          </div>
                        )
                      })}

                      {mediaPreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} style={{ position: "relative", flexShrink: 0, width: "120px", height: "120px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${borderColor}` }}>
                          <img src={preview} alt={`preview-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: isDark ? "#000" : "#f1f5f9" }} />
                          <button onClick={() => removeNewMedia(idx)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${borderColor}` }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <Hash size={16} color={mutedText} />
                      {tags.map(tag => (
                        <span key={tag} style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: `${accentColor}20`, color: accentColor, padding: "4px 10px", borderRadius: "16px", fontSize: "0.8rem", fontWeight: 600 }}>
                          #{tag}
                          <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", padding: 0, display: "flex" }}><X size={12} /></button>
                        </span>
                      ))}
                      {tags.length < 5 && (
                        <input 
                          type="text" placeholder={tags.length === 0 ? "Add tags (e.g. javascript)..." : "Add another tag..."} 
                          value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                          style={{ border: "none", background: "transparent", color: textColor, outline: "none", fontSize: "0.85rem", minWidth: "120px", flex: 1 }}
                        />
                      )}
                    </div>
                    {tags.length === 0 && <span style={{ fontSize: "0.7rem", color: mutedText, marginLeft: "24px" }}>Press Enter or comma to add</span>}
                  </div>
                </div>
              </div>

              <div style={{ padding: "1rem", borderTop: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between" }}>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} style={{ background: "none", border: "none", color: editor?.isActive('bold') ? accentColor : mutedText, cursor: "pointer" }}><Bold size={18} /></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} style={{ background: "none", border: "none", color: editor?.isActive('italic') ? accentColor : mutedText, cursor: "pointer" }}><Italic size={18} /></button>
                  <button type="button" onClick={() => { const url = window.prompt('Enter URL:'); if (url && editor) { editor.chain().focus().setLink({ href: url }).run(); } else if (url === "") { editor?.chain().focus().unsetLink().run(); } }} style={{ background: "none", border: "none", color: editor?.isActive('link') ? linkColor : mutedText, cursor: "pointer" }}><LinkIcon size={18} /></button>
                  
                  <div style={{ width: "1px", height: "20px", backgroundColor: borderColor, margin: "0 4px" }} />
                  
                  <input type="file" id="modal-image-upload" accept="image/*" multiple style={{ display: "none" }} onChange={handleMediaUpload} />
                  <label htmlFor="modal-image-upload" style={{ cursor: "pointer", color: mutedText }}><ImageIcon size={20} /></label>
                  <button type="button" onClick={() => setCodeSnippets([...codeSnippets, { id: Date.now().toString(), language: "typescript", code: "" }])} style={{ background: "none", border: "none", color: mutedText, cursor: "pointer" }}><CodeXml size={20} /></button>
                </div>

                <button onClick={handleSubmit} disabled={isSubmitting} style={{ backgroundColor: accentColor, color: "#fff", border: "none", padding: "8px 24px", borderRadius: "24px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? "Save Changes" : "Publish")} {isEditMode ? <Save size={16} /> : <Send size={16} />}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreatePostEditor;