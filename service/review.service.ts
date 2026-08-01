import { apiFetch } from "@/lib/api-client";
import type { Review } from "@/lib/types";

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  create(payload: CreateReviewPayload) {
    return apiFetch<Review>("/reviews", {
      method: "POST",
      body: payload,
    });
  },
};
