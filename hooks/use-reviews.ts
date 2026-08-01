"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import {
  reviewService,
  type CreateReviewPayload,
} from "@/service/review.service";
import { toastApiError } from "@/utils/toast-api-error";

export type CreateReviewInput = CreateReviewPayload & {
  technicianId?: string;
};

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => {
      const { technicianId: _ignored, ...payload } = input;
      void _ignored;
      return reviewService.create(payload);
    },
    onSuccess: (_data, variables) => {
      toast.success("Review submitted");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(variables.bookingId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      if (variables.technicianId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.technicians.detail(variables.technicianId),
        });
      }
    },
    onError: (error) => toastApiError(error, "Failed to submit review"),
  });
}
