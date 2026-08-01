"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import { categoryService } from "@/service/category.service";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/service/category.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => categoryService.list(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.create(payload),
    onSuccess: () => {
      toast.success("Category created");
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
    onError: (error) => toastApiError(error, "Failed to create category"),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => categoryService.update(id, payload),
    onSuccess: () => {
      toast.success("Category updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
    onError: (error) => toastApiError(error, "Failed to update category"),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      toast.success("Category deleted");
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
    onError: (error) => toastApiError(error, "Failed to delete category"),
  });
}
