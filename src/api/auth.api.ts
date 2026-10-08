import api from "./api.index"; 
import type { 
  AuthResponse, 
  RegisterPayload, 
  LoginPayload, 
  VerifyOtpPayload ,
  ResetPasswordPayload,
  UpdatePasswordPayload
} from "../types/api.types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const AuthAPI = {
  register: async (data: RegisterPayload): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/register", data);
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>("/auth/login", data);
    return response.data.data;
  },

  verifyOtp: async (data: VerifyOtpPayload): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>("/auth/verify-email", data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/logout");
  },
  
  refreshToken: async (): Promise<{ accessToken: string }> => {
  const response = await api.post<BackendResponse<{ accessToken: string }>>(
    "/auth/refresh-token"
  );

  return response.data.data;
},

  forgotPassword: async (email: string): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/forgot-password", { email });
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/reset-password", data);
  },

  updatePassword: async (data: UpdatePasswordPayload): Promise<void> => {
    await api.put<BackendResponse<null>>("/auth/update-password", data);
  },
  
  googleLogin: (): void => {
    window.location.href = `${API_URL}/auth/google`;
  },

  githubLogin: (): void => {
    window.location.href = `${API_URL}/auth/github`;
  }
};