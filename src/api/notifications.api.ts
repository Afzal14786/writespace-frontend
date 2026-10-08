import api from "./api.index";
import type { GetNotificationsResponse } from "../types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const NotificationsAPI = {
  /**
   * Fetches the user's notifications with pagination
   */
  getNotifications: async (limit: number = 20, offset: number = 0): Promise<GetNotificationsResponse> => {
    const response = await api.get<BackendResponse<GetNotificationsResponse>>(
      `/notifications?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  },

  /**
   * Marks specific notifications as read
   */
  markAsRead: async (notificationIds: number[]): Promise<void> => {
    await api.put<BackendResponse<null>>("/notifications/read", { notificationIds });
  },

  /**
   * Marks all of a user's notifications as read instantly
   */
  markAllAsRead: async (): Promise<void> => {
    await api.put<BackendResponse<null>>("/notifications/read-all");
  },
};