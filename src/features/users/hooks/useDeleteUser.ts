import { useCallback, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      return await UsersAPI.deleteUser(userId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteUser,
    loading,
    error,
  };
}
