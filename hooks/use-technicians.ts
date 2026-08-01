"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/lib/auth-store";
import type { Booking } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/service/auth.service";
import {
  technicianService,
  type TechnicianBookingActionStatus,
  type TechnicianFilters,
  type UpdateTechnicianProfilePayload,
} from "@/service/technician.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useTechnicians(filters?: TechnicianFilters) {
  return useQuery({
    queryKey: queryKeys.technicians.list(filters),
    queryFn: () => technicianService.list(filters),
  });
}

export function useTechnician(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.technicians.detail(id ?? ""),
    queryFn: () => technicianService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useTechnicianBookings() {
  return useQuery({
    queryKey: queryKeys.technicians.bookings,
    queryFn: () => technicianService.getBookings(),
  });
}

export function useUpdateTechnicianProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateTechnicianProfilePayload) =>
      technicianService.updateProfile(payload),
    onSuccess: async () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        // Keep existing session if /auth/me briefly fails
      }
    },
    onError: (error) => toastApiError(error, "Failed to update profile"),
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (availability: string[]) =>
      technicianService.updateAvailability(availability),
    onSuccess: async () => {
      toast.success("Availability saved");
      void queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        // Keep existing session if /auth/me briefly fails
      }
    },
    onError: (error) => toastApiError(error, "Failed to save availability"),
  });
}

export function useUpdateTechnicianBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: TechnicianBookingActionStatus;
    }) => technicianService.updateBookingStatus(bookingId, status),
    onMutate: async ({ bookingId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.technicians.bookings });
      const previous = queryClient.getQueryData<Booking[]>(
        queryKeys.technicians.bookings
      );

      if (previous) {
        queryClient.setQueryData<Booking[]>(
          queryKeys.technicians.bookings,
          previous.map((booking) =>
            booking.id === bookingId ? { ...booking, status } : booking
          )
        );
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.technicians.bookings,
          context.previous
        );
      }
      toastApiError(error, "Failed to update booking status");
    },
    onSuccess: (_data, { status }) => {
      toast.success(`Booking marked ${status.replace(/_/g, " ").toLowerCase()}`);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.technicians.bookings,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
