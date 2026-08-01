"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Booking } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import {
  bookingService,
  type CreateBookingPayload,
} from "@/service/booking.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.mine,
    queryFn: () => bookingService.listMine(),
  });
}

export function useBooking(id: string | undefined, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? ""),
    queryFn: () => bookingService.getById(id as string),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingService.create(payload),
    onSuccess: () => {
      toast.success("Booking requested");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: (error) => toastApiError(error, "Failed to create booking"),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.mine });
      const previous = queryClient.getQueryData<Booking[]>(queryKeys.bookings.mine);

      if (previous) {
        queryClient.setQueryData<Booking[]>(
          queryKeys.bookings.mine,
          previous.map((booking) =>
            booking.id === id
              ? { ...booking, status: "CANCELLED" as const }
              : booking
          )
        );
      }

      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings.mine, context.previous);
      }
      toastApiError(error, "Failed to cancel booking");
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
    },
    onSettled: (_data, _error, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mine });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(id),
      });
    },
  });
}
