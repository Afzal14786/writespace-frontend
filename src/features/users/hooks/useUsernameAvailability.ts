import { useCallback, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";

export function useUsernameAvailability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const checkUsername = useCallback(async (username: string) => {
    if (!username.trim()) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      return await UsersAPI.checkUsername(username.trim());
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkUsername,
    loading,
    error,
  };
}
