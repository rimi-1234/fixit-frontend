"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import {
  serviceService,
  type CreateServicePayload,
  type ServiceFilters,
  type UpdateServicePayload,
} from "@/service/service.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: () => serviceService.list(filters),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServicePayload) => serviceService.create(payload),
    onSuccess: () => {
      toast.success("Service created");
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
    onError: (error) => toastApiError(error, "Failed to create service"),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePayload }) =>
      serviceService.update(id, payload),
    onSuccess: () => {
      toast.success("Service updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
    onError: (error) => toastApiError(error, "Failed to update service"),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceService.remove(id),
    onSuccess: () => {
      toast.success("Service deleted");
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
    onError: (error) => toastApiError(error, "Failed to delete service"),
  });
}
