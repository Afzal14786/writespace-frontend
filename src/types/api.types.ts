
export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  bio?: string;
  headline?: string;
  location?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  bannerImageUrl?: string;
  bannerImagePublicId?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  website?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  geeksforgeeks?: string;
  totalPosts?: number;
  totalReads?: number;
  totalFollowers?: number;
  totalFollowing?: number;
  status?: "active" | "suspended" | "banned";
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
  isFollowingByMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Matches src/modules/auth/dtos/register.dto.ts
export interface RegisterPayload {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

// Matches src/modules/auth/dtos/login.dto.ts
export interface LoginPayload {
  email: string;
  password: string;
}

// Matches src/modules/auth/dtos/verify-otp.dto.ts
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// Post Types
export interface CodeSnippet {
  language: string;
  code: string;
  title?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  content: string;
  excerpt?: string | null;
  media?: string[] | null;
  codeSnippets?: CodeSnippet[] | null; // Added codeSnippets
  coverImageUrl?: string | null;
  tags?: string[] | null;
  authorId: string;
  
  // Added from your backend Drizzle joins
  author: {
    id: string;
    username: string;
    fullname: string;
    profileImageUrl?: string | null;
    isFollowingByMe?: boolean;
  };
  isLikedByMe: boolean; // Crucial for Optimistic UI

  status: "draft" | "published" | "archived";
  publishDate?: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  readTime?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  images?: File[]; 
  codeSnippets?: Omit<CodeSnippet, 'id'>[];
  tags?: string[];
}

export interface CommentData {
  id: string;
  content: string;
  parentCommentId: string | null;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    fullname: string;
    profileImageUrl: string | null;
  };
  isLikedByMe: boolean;
}

export interface PaginatedCommentsResponse {
  comments: CommentData[];
  nextCursor: string | null;
}

export interface PaginatedRepliesResponse {
  replies: CommentData[];
  nextCursor: string | null;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export type NotificationType = 
  | "LIKE" 
  | "COMMENT" 
  | "FOLLOW" 
  | "SHARE" 
  | "WELCOME" 
  | "SYSTEM";

export interface NotificationActor {
  id: string;
  username: string;
  fullname: string;
  profileImageUrl: string | null;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface GetNotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}