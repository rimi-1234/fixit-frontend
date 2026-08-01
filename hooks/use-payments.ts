"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import {
  paymentService,
  type CreatePaymentPayload,
} from "@/service/payment.service";
import { toastApiError } from "@/utils/toast-api-error";

export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.mine,
    queryFn: () => paymentService.listMine(),
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id ?? ""),
    queryFn: () => paymentService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentService.create(payload),
    onSuccess: (data) => {
      toast.success("Redirecting to payment…");
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      }
    },
    onError: (error) => toastApiError(error, "Failed to start payment"),
  });
}
