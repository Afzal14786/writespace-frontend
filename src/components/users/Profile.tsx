import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { UsersAPI } from "../../api/users.api";
import { PostsAPI } from "../../api/posts.api";
import type { User, Post } from "../../types/api.types";
import { toast } from "react-toastify";

import ProfileIdentity from "./ProfileIdentity";
import ProfileContent from "./ProfileContent";
import ProfileAnalytics from "./ProfileAnalytics";
import EditProfileModal from "./EditProfileModal";

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { theme } = useTheme();
  
  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth(); 

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(0);

  const isMeRoute = !username || username === "me";
  const targetUsername = isMeRoute ? authUser?.username : username;
  const isOwnProfile = isMeRoute || (authUser?.username === targetUsername);

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const mutedText = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUsername) return; 

      setIsLoading(true);
      try {
        const userData = await UsersAPI.getProfileByUsername(targetUsername);
        
        setProfileUser(userData);
        setIsFollowing(userData.isFollowingByMe ?? false);
        setFollowerCount(userData.totalFollowers ?? 0);

        const postsData = await PostsAPI.getPosts({ authorId: userData.id, limit: 10 });
        setPosts(postsData.posts);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("User not found.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUsername]);

  if (isMeRoute && !isLoadingAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profileUser || !authUser) return toast.error("Please log in to follow users.");
    
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

    try {
      await UsersAPI.toggleFollow(profileUser.id);
    } catch (error) {
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
      toast.error("Failed to update follow status.");
      console.error(error); 
    }
  };

  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem", color: mutedText }}>Loading profile...</div>;
  if (!profileUser) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem", color: mutedText }}>User not found.</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bgColor, padding: "20px", display: "flex", justifyContent: "center", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      
      <style>
        {`
          .profile-bento-grid {
            display: grid;
            grid-template-columns: 300px minmax(0, 1fr) 300px;
            gap: 24px;
            max-width: 1280px;
            width: 100%;
            align-items: start; 
          }
          
          .grid-col-safe {
             min-width: 0;
             width: 100%;
          }

          .sticky-col {
            position: sticky;
            top: 88px;
            height: max-content; 
          }

          @media (max-width: 1024px) {
            .profile-bento-grid {
              grid-template-columns: 300px minmax(0, 1fr);
            }
            .profile-analytics-col {
              grid-column: 1 / -1; 
              position: static !important;
            }
          }
          
          @media (max-width: 768px) {
            .profile-bento-grid {
              grid-template-columns: minmax(0, 1fr);
            }
            .sticky-col {
              position: static !important; 
            }
          }
        `}
      </style>

      <div className="profile-bento-grid">
        
        <div className="grid-col-safe sticky-col">
          <ProfileIdentity 
            profileUser={profileUser} 
            isOwnProfile={isOwnProfile} 
            isFollowing={isFollowing} 
            onToggleFollow={handleToggleFollow} 
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        </div>

        <div className="grid-col-safe">
          <ProfileContent 
            posts={posts} 
            profileUser={profileUser} 
            isFollowing={isFollowing} 
          />
        </div>

        <div className="profile-analytics-col grid-col-safe sticky-col">
          <ProfileAnalytics 
            profileUser={profileUser} 
            followerCount={followerCount} 
          />
        </div>

      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          user={profileUser} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={(updated: Partial<User>) => setProfileUser(prev => prev ? { ...prev, ...updated } : null)} 
        />
      )}
    </div>
  );
};

export default Profile;