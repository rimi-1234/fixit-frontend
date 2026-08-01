import { apiFetch } from "@/lib/api-client";
import type { CreatePaymentResult, Payment, PaymentProvider } from "@/lib/types";

export interface CreatePaymentPayload {
  bookingId: string;
  provider?: PaymentProvider;
}

export const paymentService = {
  create(payload: CreatePaymentPayload) {
    return apiFetch<CreatePaymentResult>("/payments/create", {
      method: "POST",
      body: payload,
    });
  },

  listMine() {
    return apiFetch<Payment[]>("/payments");
  },

  getById(id: string) {
    return apiFetch<Payment>(`/payments/${id}`);
  },
};
