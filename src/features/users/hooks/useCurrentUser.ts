import { useCallback, useEffect, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";
import type { User } from "@/features/users/types/user.types";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await UsersAPI.getMe();
      setUser(data);

      return data;
    } catch (err) {
      setError(err);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    setUser,
  };
}
