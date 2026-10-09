import { useCallback, useState } from "react";

import { PostsAPI } from "@/features/posts/api/posts.api";
import type { SharePostResponse } from "@/features/posts/types/post.types";

export function usePostShare(postId: string) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<SharePostResponse | null>(
    null,
  );

  const sharePost = useCallback(
    async (platform?: string): Promise<SharePostResponse> => {
      if (isSharing) {
        throw new Error("A share operation is already in progress.");
      }

      setIsSharing(true);

      try {
        const result = await PostsAPI.sharePost(postId, platform);
        setShareResult(result);
        return result;
      } finally {
        setIsSharing(false);
      }
    },
    [postId, isSharing],
  );

  const resetShareResult = useCallback(() => {
    setShareResult(null);
  }, []);

  return {
    isSharing,
    shareResult,
    sharePost,
    resetShareResult,
  };
}
