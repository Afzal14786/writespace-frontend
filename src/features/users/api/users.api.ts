import api from "@/lib/api/api";

import type {
  FollowResponse,
  UpdateProfilePayload,
  User,
  UserSearchResult,
  UsernameAvailability,
} from "@/features/users/types/user.types";

import { buildUpdateProfileFormData } from "@/features/users/utils/profile-form-data";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const UsersAPI = {
  async checkUsername(username: string): Promise<UsernameAvailability> {
    const response = await api.get<ApiResponse<UsernameAvailability>>(
      "/users/check-username",
      {
        params: { username },
      },
    );

    return response.data.data;
  },

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const response = await api.get<ApiResponse<UserSearchResult[]>>(
      "/users/search",
      {
        params: { q: query },
      },
    );

    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>("/users/me");

    return response.data.data;
  },

  async getProfile(
    username: string,
  ): Promise<User & { isFollowingByMe: boolean }> {
    const response = await api.get<
      ApiResponse<User & { isFollowingByMe: boolean }>
    >(`/users/profile/${encodeURIComponent(username)}`);

    return response.data.data;
  },

  async getProfileByUsername(
    username: string,
  ): Promise<User & { isFollowingByMe: boolean }> {
    return this.getProfile(username);
  },

  async toggleFollow(userId: string): Promise<FollowResponse> {
    const response = await api.post<ApiResponse<FollowResponse>>(
      `/users/${userId}/follow`,
    );

    return response.data.data;
  },

  async updateProfile(
    userId: string,
    payload: UpdateProfilePayload,
  ): Promise<User> {
    const formData = buildUpdateProfileFormData(payload);

    const response = await api.put<ApiResponse<User>>(
      `/users/${userId}`,
      formData,
    );

    return response.data.data;
  },

  async deleteUser(userId: string): Promise<null> {
    const response = await api.delete<ApiResponse<null>>(`/users/${userId}`);

    return response.data.data;
  },
};

export type {
  FollowResponse,
  UpdateProfilePayload,
  User,
  UserSearchResult,
  UsernameAvailability,
};
