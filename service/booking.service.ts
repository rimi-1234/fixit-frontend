import { apiFetch } from "@/lib/api-client";
import type { Booking } from "@/lib/types";

export interface CreateBookingPayload {
  technicianId: string;
  serviceId: string;
  /** ISO 8601 datetime string */
  scheduledTime: string;
}

export const bookingService = {
  create(payload: CreateBookingPayload) {
    return apiFetch<Booking>("/bookings", {
      method: "POST",
      body: payload,
    });
  },

  listMine() {
    return apiFetch<Booking[]>("/bookings");
  },

  getById(id: string) {
    return apiFetch<Booking>(`/bookings/${id}`);
  },

  cancel(id: string) {
    return apiFetch<Booking>(`/bookings/${id}/cancel`, {
      method: "PATCH",
    });
  },
};
