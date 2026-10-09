import { useCallback, useState } from "react";

import { UsersAPI } from "@/features/users/api/users.api";
import type { UserSearchResult } from "@/features/users/types/user.types";

export function useUserSearch() {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const data = await UsersAPI.searchUsers(query.trim());
      setResults(data);

      return data;
    } catch (err) {
      setError(err);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clear,
  };
}
