export interface User {
  id: string;

  // Personal information
  fullname: string;
  username: string;
  email: string;
  bio: string;
  headline: string;
  location: string;

  // Profile media
  profileImageUrl: string;
  profileImagePublicId: string;
  bannerImageUrl: string;
  bannerImagePublicId: string;

  // Social links
  twitter: string;
  github: string;
  website: string;
  linkedin: string;
  youtube: string;
  instagram: string;
  facebook: string;
  leetcode: string;
  geeksforgeeks: string;
  codeforces: string;

  // Account statistics
  totalPosts: number;
  totalReads: number;
  totalFollowers: number;
  totalFollowing: number;

  // Account information
  status: "active" | "suspended" | "banned";
  role: "user" | "admin";

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Present only on public profile responses
  isFollowingByMe?: boolean;
}

export interface PersonalInfo {
  fullname?: string;
  headline?: string;
  location?: string;
  bio?: string;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  leetcode?: string;
  geeksforgeeks?: string;
  codeforces?: string;
}

export interface UpdateProfilePayload {
  personal_info?: PersonalInfo;
  social_links?: SocialLinks;
  profileImage?: File;
  bannerImage?: File;
}

export interface UsernameAvailability {
  available: boolean;
  suggestions?: string[];
}

export interface UserSearchResult {
  id: string;
  username: string;
  fullname: string;
  profileImageUrl: string;
  headline: string;
}

export interface FollowResponse {
  status: "followed" | "unfollowed";
}
