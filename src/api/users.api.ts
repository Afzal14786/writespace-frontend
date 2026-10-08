import api from "./api.index";
import type { User } from "../types/api.types";

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface UpdateProfilePayload {
  personal_info?: {
    fullname?: string;
    bio?: string;
    headline?: string;
    location?: string;
  };
  social_links?: {
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    leetcode?: string;
    codeforces?: string;
    geeksforgeeks?: string;
  };
  profileImage?: File;
  bannerImage?: File;
}

export interface UsernameCheckResponse {
  available: boolean;
  suggestions?: string[];
}

export const UsersAPI = {
  checkUsername: async (username: string): Promise<UsernameCheckResponse> => {
    const response = await api.get<BackendResponse<UsernameCheckResponse>>(
      `/users/check-username`, 
      { params: { username } }
    );
    return response.data.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get<BackendResponse<User>>(`/users/me`);
    return response.data.data; 
  },

  getProfileByUsername: async (username: string): Promise<User> => {
    const response = await api.get<BackendResponse<User>>(`/users/profile/${username}`);
    return response.data.data;
  },

  updateProfile: async (userId: string, payload: UpdateProfilePayload): Promise<User> => {
    const formData = new FormData();

    if (payload.personal_info) {
      formData.append("personal_info", JSON.stringify(payload.personal_info));
    }
    if (payload.social_links) {
      formData.append("social_links", JSON.stringify(payload.social_links));
    }
    
    if (payload.profileImage) {
      formData.append("profileImage", payload.profileImage);
    }
    if (payload.bannerImage) {
      formData.append("bannerImage", payload.bannerImage);
    }

    const response = await api.put(`/users/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  deleteProfile: async (userId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(`/users/${userId}`);
  },

  toggleFollow: async (userId: string): Promise<{ status: "followed" | "unfollowed" }> => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  }
};