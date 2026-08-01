"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import {
  reviewService,
  type CreateReviewPayload,
} from "@/service/review.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewService.create(payload),
    onSuccess: (_data, variables) => {
      toast.success("Review submitted");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(variables.bookingId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
    },
    onError: (error) => toastApiError(error, "Failed to submit review"),
  });
}
