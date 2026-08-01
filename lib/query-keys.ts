import type { AdminBookingFilters, AdminUserFilters } from "@/service/admin.service";
import type { ServiceFilters } from "@/service/service.service";
import type { TechnicianFilters } from "@/service/technician.service";

export const queryKeys = {
  services: {
    all: ["services"] as const,
    list: (filters?: ServiceFilters) => ["services", "list", filters ?? {}] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: ["categories", "list"] as const,
  },
  technicians: {
    all: ["technicians"] as const,
    list: (filters?: TechnicianFilters) =>
      ["technicians", "list", filters ?? {}] as const,
    detail: (id: string) => ["technicians", "detail", id] as const,
    bookings: ["technicians", "bookings"] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    mine: ["bookings", "mine"] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    mine: ["payments", "mine"] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },
  admin: {
    users: (filters?: AdminUserFilters) =>
      ["admin", "users", filters ?? {}] as const,
    bookings: (filters?: AdminBookingFilters) =>
      ["admin", "bookings", filters ?? {}] as const,
    categories: ["admin", "categories"] as const,
  },
};
