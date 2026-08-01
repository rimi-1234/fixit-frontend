"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { User, UserStatus } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import {
  adminService,
  type AdminBookingFilters,
  type AdminCategoryPayload,
  type AdminUserFilters,
} from "@/service/admin.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => adminService.listUsers(filters),
  });
}

export function useAdminBookings(filters?: AdminBookingFilters) {
  return useQuery({
    queryKey: queryKeys.admin.bookings(filters),
    queryFn: () => adminService.listBookings(filters),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => adminService.listCategories(),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminService.updateUserStatus(userId, status),
    onMutate: async ({ userId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });
      const snapshots = queryClient.getQueriesData<User[]>({
        queryKey: ["admin", "users"],
      });

      for (const [key, users] of snapshots) {
        if (!users) continue;
        queryClient.setQueryData<User[]>(
          key,
          users.map((user) =>
            user.id === userId ? { ...user, status } : user
          )
        );
      }

      return { snapshots };
    },
    onError: (error, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toastApiError(error, "Failed to update user status");
    },
    onSuccess: (_data, { status }) => {
      toast.success(status === "BANNED" ? "User banned" : "User unbanned");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminCategoryPayload) =>
      adminService.createCategory(payload),
    onSuccess: () => {
      toast.success("Category created");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => toastApiError(error, "Failed to create category"),
  });
}

export function useAdminUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AdminCategoryPayload>;
    }) => adminService.updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => toastApiError(error, "Failed to update category"),
  });
}

export function useAdminDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.removeCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => toastApiError(error, "Failed to delete category"),
  });
}
