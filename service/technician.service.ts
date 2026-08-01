import { apiFetch } from "@/lib/api-client";
import type {
  Booking,
  BookingStatus,
  TechnicianDetail,
  TechnicianProfile,
  TechnicianSummary,
} from "@/lib/types";
import { toQueryString } from "@/utils/to-query-string";

export interface TechnicianFilters {
  skill?: string;
  location?: string;
  minExperience?: number;
  minRating?: number;
  search?: string;
}

export interface UpdateTechnicianProfilePayload {
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  location?: string;
}

export type TechnicianBookingActionStatus = Extract<
  BookingStatus,
  "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED"
>;

export const technicianService = {
  list(filters?: TechnicianFilters) {
    return apiFetch<TechnicianSummary[]>(
      `/technicians${toQueryString(filters)}`,
      { skipAuth: true }
    );
  },

  getById(id: string) {
    return apiFetch<TechnicianDetail>(`/technicians/${id}`, {
      skipAuth: true,
    });
  },

  updateProfile(payload: UpdateTechnicianProfilePayload) {
    return apiFetch<TechnicianProfile>("/technicians/profile", {
      method: "PUT",
      body: payload,
    });
  },

  updateAvailability(availability: string[]) {
    return apiFetch<TechnicianProfile>("/technicians/availability", {
      method: "PUT",
      body: { availability },
    });
  },

  getBookings() {
    return apiFetch<Booking[]>("/technicians/bookings");
  },

  updateBookingStatus(bookingId: string, status: TechnicianBookingActionStatus) {
    return apiFetch<Booking>(`/technicians/bookings/${bookingId}`, {
      method: "PATCH",
      body: { status },
    });
  },
};
