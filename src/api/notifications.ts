/**
 * Notifications now use the shared `api` instance from ./auth.
 *
 * This file previously created its own axios instance, which had two problems:
 *
 *  1. It read VITE_API_URL, which is not set anywhere — only VITE_BACKEND_URL
 *     is. It therefore fell back to http://localhost:5000, so notifications
 *     were pointed at localhost in every deployed environment.
 *  2. It had only a request interceptor. Since CC-01b shortened access tokens
 *     to 15 minutes, it would have started 401ing after a quarter of an hour
 *     with no refresh and no recovery.
 *
 * The shared instance has both interceptors and the correct base URL, so
 * duplicating it here was never buying anything.
 */
import { api } from "./auth";

export interface Notification {
  id: string;
  type:
    | "COMPLAINT_STATUS_UPDATE"
    | "COMPLAINT_ASSIGNED"
    | "DOUBT_ANSWER"
    | "DOUBT_ACCEPTED"
    | "ANSWER_UPVOTED"
    | "GENERAL";
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

// Get user notifications
export const getNotifications = async (
  limit?: number,
): Promise<NotificationsResponse> => {
  const url = limit
    ? `/notifications?limit=${limit}`
    : "/notifications";
  const response = await api.get<NotificationsResponse>(url);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get<UnreadCountResponse>(
    "/notifications/unread-count",
  );
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await api.patch("/notifications/mark-all-read");
};

// Test endpoint to create a sample notification
export const createTestNotification = async (): Promise<void> => {
  console.log("Frontend: Creating test notification...");
  const response = await api.post("/notifications/test");
  console.log("Frontend: Test notification response:", response.data);
};

// Utility function to determine where a notification should navigate to
export const getNotificationRoute = (
  notification: Notification,
  userRole: string,
): string | null => {
  const { type, data } = notification;

  switch (type) {
    case "COMPLAINT_STATUS_UPDATE":
    case "COMPLAINT_ASSIGNED":
      // Redirect to complaint management based on user role
      if (userRole === "STUDENT") return "/student/complaints";
      if (userRole === "FACULTY") return "/faculty/complaints";
      if (userRole === "SUPER_ADMIN") return "/superadmin/complaints";
      if (userRole === "ADMIN") return "/admin/complaints";
      break;

    case "DOUBT_ANSWER":
    case "DOUBT_ACCEPTED":
    case "ANSWER_UPVOTED": {
      // Redirect to specific doubt if we have the ID
      const doubtId = data?.doubtId as string;
      if (doubtId) {
        if (userRole === "STUDENT") return `/student/doubts/${doubtId}`;
        if (userRole === "FACULTY") return `/faculty/doubts/${doubtId}`;
      }
      // Fallback to doubts list
      if (userRole === "STUDENT") return "/student/doubts";
      if (userRole === "FACULTY") return "/faculty/doubts";
      break;
    }

    case "GENERAL":
      // For general notifications, redirect to dashboard
      if (userRole === "STUDENT") return "/student/dashboard";
      if (userRole === "FACULTY") return "/faculty/dashboard";
      if (userRole === "ADMIN") return "/admin/dashboard";
      if (userRole === "SUPER_ADMIN") return "/superadmin/dashboard";
      break;
  }

  return null;
};
