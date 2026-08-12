import { apiFetch } from "@/lib/api-client";
import type { Service } from "@/lib/types";
import { toQueryString } from "@/utils/to-query-string";

export interface ServiceFilters {
  search?: string;
  type?: string;
  categoryId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string | null;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

export const serviceService = {
  list(filters?: ServiceFilters) {
    return apiFetch<Service[]>(`/services${toQueryString(filters)}`, {
      skipAuth: true,
    });
  },

  getById(id: string) {
    return apiFetch<Service & { related: Service[]; technician: { id: string; email: string; name?: string | null; technicianProfile: import("@/lib/types").TechnicianProfile | null; averageRating: number; reviewCount: number; reviews: Array<{ rating: number; comment: string | null; createdAt: string; customer: { id: string; email: string; name?: string | null } }> } }>(`/api/services/${id}`, {
      skipAuth: true,
      sameOrigin: true,
    });
  },

  create(payload: CreateServicePayload) {
    return apiFetch<Service>("/services", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: UpdateServicePayload) {
    return apiFetch<Service>(`/services/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiFetch<Service>(`/services/${id}`, {
      method: "DELETE",
    });
  },
};
