import { apiFetch } from "@/lib/api-client";
import type {
  Booking,
  BookingStatus,
  Category,
  Role,
  User,
  UserStatus,
} from "@/lib/types";
import { toQueryString } from "@/utils/to-query-string";

export interface AdminUserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
}

export interface AdminBookingFilters {
  status?: BookingStatus;
}

export interface AdminCategoryPayload {
  name: string;
  slug: string;
}

export const adminService = {
  listUsers(filters?: AdminUserFilters) {
    return apiFetch<User[]>(`/admin/users${toQueryString(filters)}`);
  },

  updateUserStatus(userId: string, status: UserStatus) {
    return apiFetch<User>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: { status },
    });
  },

  listBookings(filters?: AdminBookingFilters) {
    return apiFetch<Booking[]>(`/admin/bookings${toQueryString(filters)}`);
  },

  listCategories() {
    return apiFetch<Category[]>("/admin/categories");
  },

  createCategory(payload: AdminCategoryPayload) {
    return apiFetch<Category>("/admin/categories", {
      method: "POST",
      body: payload,
    });
  },

  updateCategory(id: string, payload: Partial<AdminCategoryPayload>) {
    return apiFetch<Category>(`/admin/categories/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  removeCategory(id: string) {
    return apiFetch<Category>(`/admin/categories/${id}`, {
      method: "DELETE",
    });
  },
};
