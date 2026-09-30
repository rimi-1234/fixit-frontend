import { apiFetch } from "@/lib/api-client";
import type { Notification } from "@/lib/types";

export const notificationService = {
  getAll() {
    return apiFetch<Notification[]>("/notifications");
  },

  getUnreadCount() {
    return apiFetch<{ count: number }>("/notifications/unread-count");
  },

  markAsRead(id: string) {
    return apiFetch<Notification>(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllAsRead() {
    return apiFetch<null>("/notifications/read-all", { method: "PATCH" });
  },

  delete(id: string) {
    return apiFetch<null>(`/notifications/${id}`, { method: "DELETE" });
  },
};
