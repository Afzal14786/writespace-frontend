import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";

import { PostsAPI } from "@/features/posts/posts.api";
import { useToggleFollow } from "@/features/users/hooks/useToggleFollow";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import type { User } from "@/features/users/types/user.types";

import type { Post } from "@/types/api.types";

import EditProfileModal from "../edit-profile/EditProfileModal";

import ProfileAnalytics from "./ProfileAnalytics";
import ProfileContent from "./ProfileContent";
import ProfileIdentity from "./ProfileIdentity";
import ProfileSidebar from "./ProfileSidebar";

export default function Profile() {
  const { username } = useParams<{ username: string }>();

  const { user: authUser, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  /*
   * /profile/me
   *
   * If no username is supplied or username === "me",
   * resolve the current authenticated user's username.
   */
  const isMeRoute = !username || username === "me";

  const targetUsername = isMeRoute ? authUser?.username : username;

  const isOwnProfile = isMeRoute || authUser?.username === targetUsername;

  /*
   * Users module:
   *
   * GET /users/profile/:username
   */
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    setProfile,
  } = useUserProfile(targetUsername);

  /*
   * Users module:
   *
   * POST /users/:id/follow
   */
  const { toggleFollow, loading: followLoading } = useToggleFollow();

  /*
   * Posts are still handled by the Posts module.
   *
   * We are keeping this temporarily because Posts
   * is the next module we will integrate properly.
   */
  const [posts, setPosts] = useState<Post[]>([]);

  /*
   * Local follow UI state.
   *
   * Initial values come from the backend profile:
   *
   * - isFollowingByMe
   * - totalFollowers
   */
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /*
   * Synchronize local follow state whenever
   * the loaded profile changes.
   */
  useEffect(() => {
    if (!profile) {
      return;
    }

    setIsFollowing(profile.isFollowingByMe ?? false);
    setFollowerCount(profile.totalFollowers ?? 0);
  }, [profile]);

  /*
   * Fetch posts belonging to this profile.
   *
   * This is intentionally kept simple for now.
   * Posts will be properly integrated when we move
   * to the Posts module.
   */
  useEffect(() => {
    if (!profile?.id) {
      setPosts([]);
      return;
    }

    let cancelled = false;

    const fetchProfilePosts = async () => {
      try {
        const response = await PostsAPI.getPosts({
          authorId: profile.id,
          limit: 10,
        });

        if (!cancelled) {
          setPosts(response.posts ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch profile posts:", error);

          setPosts([]);

          toast.error("Unable to load profile posts.");
        }
      }
    };

    void fetchProfilePosts();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  /*
   * Authentication guard for /profile/me.
   */
  if (isMeRoute && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /*
   * For /profile/me, wait until AuthProvider has
   * resolved the current user's username.
   */
  if (isMeRoute && !targetUsername) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading profile...
      </div>
    );
  }

  /*
   * Profile loading state.
   */
  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading profile...
      </div>
    );
  }

  /*
   * Profile could not be loaded.
   */
  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <h2 className="text-xl font-semibold">Profile not found</h2>

        <p className="text-sm text-muted-foreground">
          We couldn't load this profile.
        </p>

        <button
          type="button"
          onClick={() => void refetchProfile()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  /*
   * Follow / unfollow
   *
   * Backend:
   * POST /users/:id/follow
   *
   * Response:
   * { status: "followed" | "unfollowed" }
   */
  const handleToggleFollow = async () => {
    if (followLoading) {
      return;
    }

    const previousFollowing = isFollowing;
    const previousFollowerCount = followerCount;

    const optimisticFollowing = !previousFollowing;

    /*
     * Optimistic UI update.
     */
    setIsFollowing(optimisticFollowing);

    setFollowerCount(
      optimisticFollowing
        ? previousFollowerCount + 1
        : Math.max(previousFollowerCount - 1, 0),
    );

    try {
      const result = await toggleFollow(profile.id);

      const serverFollowing = result.status === "followed";

      /*
       * Normally the server result should match
       * the optimistic state.
       *
       * If it doesn't, synchronize with the server.
       */
      if (serverFollowing !== optimisticFollowing) {
        setIsFollowing(serverFollowing);

        setFollowerCount(
          serverFollowing
            ? previousFollowerCount + 1
            : Math.max(previousFollowerCount - 1, 0),
        );
      }

      /*
       * Keep the Users profile state synchronized.
       */
      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          isFollowingByMe: serverFollowing,
          totalFollowers: serverFollowing
            ? previousFollowerCount + 1
            : Math.max(previousFollowerCount - 1, 0),
        };
      });
    } catch (error) {
      console.error("Failed to toggle follow:", error);

      /*
       * Roll back optimistic update.
       */
      setIsFollowing(previousFollowing);
      setFollowerCount(previousFollowerCount);

      toast.error("Unable to update follow status. Please try again.");
    }
  };

  /*
   * Edit Profile currently owns the update operation.
   *
   * The Edit Profile module will be cleaned up next.
   */
  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    setProfile((currentProfile) => {
      if (!currentProfile) {
        return currentProfile;
      }

      return {
        ...currentProfile,
        ...updatedUser,
      };
    });

    setIsEditModalOpen(false);

    toast.success("Profile updated successfully.");
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-background text-foreground"
          : "bg-background text-foreground"
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
          {/* Left sidebar */}
          <aside className="hidden lg:block">
            <ProfileSidebar />
          </aside>

          {/* Main profile */}
          <main className="min-w-0">
            <ProfileIdentity
              profileUser={profile}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onToggleFollow={handleToggleFollow}
              onOpenEditModal={() => setIsEditModalOpen(true)}
            />

            <div className="mt-6">
              <ProfileContent
                profileUser={profile}
                posts={posts}
                isFollowing={isFollowing}
              />
            </div>
          </main>

          {/* Right analytics */}
          <aside className="hidden lg:block">
            <ProfileAnalytics
              profileUser={profile}
              followerCount={followerCount}
            />
          </aside>
        </div>
      </div>

      {isEditModalOpen && isOwnProfile && (
        <EditProfileModal
          user={profile}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
