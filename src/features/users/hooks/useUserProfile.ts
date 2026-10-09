import { useCallback, useEffect, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";
import type { User } from "@/features/users/types/user.types";

type UserProfile = User & {
  isFollowingByMe: boolean;
};

export function useUserProfile(username?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setProfile(null);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await UsersAPI.getProfile(username);
      setProfile(data);

      return data;
    } catch (err) {
      setError(err);
      setProfile(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    setProfile,
  };
}
