import { apiFetch } from "@/lib/api-client";
import type { LoginResult, Role, User } from "@/lib/types";

export interface RegisterPayload {
  email: string;
  password: string;
  role?: Extract<Role, "CUSTOMER" | "TECHNICIAN">;
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  location?: string;
  imageUrl?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface DemoLoginPayload {
  role: Role;
}

export const authService = {
  register(payload: RegisterPayload) {
    return apiFetch<LoginResult>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  login(payload: LoginPayload) {
    return apiFetch<LoginResult>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  /** Signs into a seeded role account via Next.js BFF (credentials stay server-side). */
  demoLogin(payload: DemoLoginPayload) {
    return apiFetch<LoginResult>("/api/auth/demo-login", {
      method: "POST",
      body: payload,
      skipAuth: true,
      sameOrigin: true,
    });
  },

  me() {
    return apiFetch<User>("/api/auth/me", { sameOrigin: true });
  },

  updateProfile(payload: { name?: string | null; phone?: string | null; imageUrl?: string | null }) {
    return apiFetch<User>("/api/auth/me", {
      method: "PATCH",
      body: payload,
      sameOrigin: true,
    });
  },
};
