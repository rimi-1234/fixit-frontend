import { apiFetch } from "@/lib/api-client";
import type { FavoriteTechnician } from "@/lib/types";

export const favoriteService = {
  getAll() {
    return apiFetch<FavoriteTechnician[]>("/favorites");
  },

  isFavorite(technicianId: string) {
    return apiFetch<{ isFavorite: boolean }>(`/favorites/${technicianId}`);
  },

  add(technicianId: string) {
    return apiFetch<FavoriteTechnician>(`/favorites/${technicianId}`, { method: "POST" });
  },

  remove(technicianId: string) {
    return apiFetch<null>(`/favorites/${technicianId}`, { method: "DELETE" });
  },
};
