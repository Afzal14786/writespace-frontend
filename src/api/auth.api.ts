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

  forgotPassword: async (email: string): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/forgot-password", { email });
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<void> => {
    await api.post<BackendResponse<null>>("/auth/reset-password", data);
  },

  updatePassword: async (data: UpdatePasswordPayload): Promise<AuthResponse> => {
    const response = await api.put<AuthResponse>("/auth/update-password", data);
    return response.data;
  },
  
  googleLogin: (): void => {
    window.location.href = `${API_URL}/auth/google`;
  },

  githubLogin: (): void => {
    window.location.href = `${API_URL}/auth/github`;
  }
};