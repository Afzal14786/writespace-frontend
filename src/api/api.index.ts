import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

// 1. MODULE AUGMENTATION: We inject _retry safely into native Axios types
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const url = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: url,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    const isAuthRoute = 
      originalRequest?.url?.includes('/auth/login') || 
      originalRequest?.url?.includes('/auth/register') || 
      originalRequest?.url?.includes('/auth/verify-email') || 
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post(
          `/auth/refresh-token`,
          {}, 
          { _retry: true }
        );

        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("user");
        localStorage.removeItem("feedCache");
        window.dispatchEvent(new Event("auth:force-logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;