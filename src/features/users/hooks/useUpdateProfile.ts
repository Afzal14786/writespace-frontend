import { useCallback, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";
import type {
  UpdateProfilePayload,
  User,
} from "@/features/users/types/user.types";

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const updateProfile = useCallback(
    async (userId: string, payload: UpdateProfilePayload): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        return await UsersAPI.updateProfile(userId, payload);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    updateProfile,
    loading,
    error,
  };
}
