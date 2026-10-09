import { useCallback, useEffect, useState } from "react";

import { InteractionsAPI } from "@/features/interactions/interactions.api";
import { UsersAPI } from "@/features/users/api/users.api";

interface UsePostActionsOptions {
  postId: string;
  authorId: string;
  initialIsLiked?: boolean;
  initialIsFollowing?: boolean;
  initialIsSaved?: boolean;
}

export function usePostActions({
  postId,
  authorId,
  initialIsLiked = false,
  initialIsFollowing = false,
  initialIsSaved = false,
}: UsePostActionsOptions) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const [isLiking, setIsLiking] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync server-provided state when the post or its data changes.
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [postId, initialIsLiked]);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const toggleLike = useCallback(async (): Promise<boolean> => {
    if (isLiking) return isLiked;

    setIsLiking(true);

    try {
      const result = isLiked
        ? await InteractionsAPI.removePostReaction(postId)
        : await InteractionsAPI.setPostReaction(postId, "like");

      setIsLiked(result.isReacted);
      return result.isReacted;
    } finally {
      setIsLiking(false);
    }
  }, [postId, isLiked, isLiking]);

  const toggleFollow = useCallback(async () => {
    if (isFollowingLoading) return;

    if (!authorId) {
      throw new Error("Cannot follow a user without an author ID.");
    }

    setIsFollowingLoading(true);

    try {
      const result = await UsersAPI.toggleFollow(authorId);
      setIsFollowing(result.status === "followed");
    } finally {
      setIsFollowingLoading(false);
    }
  }, [authorId, isFollowingLoading]);

  const toggleSave = useCallback(async (): Promise<boolean> => {
    if (isSaving) return isSaved;

    setIsSaving(true);

    try {
      if (isSaved) {
        const result = await InteractionsAPI.unsavePost(postId);
        setIsSaved(result.isSaved);
        return result.isSaved;
      }

      const result = await InteractionsAPI.savePost(postId);
      setIsSaved(result.isSaved);
      return result.isSaved;
    } finally {
      setIsSaving(false);
    }
  }, [postId, isSaved, isSaving]);

  return {
    isLiked,
    isFollowing,
    isSaved,
    isLiking,
    isFollowingLoading,
    isSaving,
    toggleLike,
    toggleFollow,
    toggleSave,
  };
}
