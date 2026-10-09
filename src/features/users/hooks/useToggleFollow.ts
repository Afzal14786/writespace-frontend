import { useCallback, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";

export function useToggleFollow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const toggleFollow = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      return await UsersAPI.toggleFollow(userId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    toggleFollow,
    loading,
    error,
  };
}
