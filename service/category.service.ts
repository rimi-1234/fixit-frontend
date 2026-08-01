import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/lib/types";

export interface CreateCategoryPayload {
  name: string;
  slug: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export const categoryService = {
  list() {
    return apiFetch<Category[]>("/categories", { skipAuth: true });
  },

  create(payload: CreateCategoryPayload) {
    return apiFetch<Category>("/categories", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: UpdateCategoryPayload) {
    return apiFetch<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiFetch<Category>(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};
