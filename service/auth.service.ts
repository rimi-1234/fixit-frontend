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
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register(payload: RegisterPayload) {
    return apiFetch<User>("/auth/register", {
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

  me() {
    return apiFetch<User>("/auth/me");
  },
};
