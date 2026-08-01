"use client";

import { create } from "zustand";

import {
  clearSessionStorage,
  getAccessToken,
  getStoredRole,
  persistSession,
} from "@/lib/auth-token";
import type { AuthUser, Role, User } from "@/lib/types";

interface AuthState {
  user: AuthUser | User | null;
  token: string | null;
  role: Role | null;
  /** False until we finish reading cookies / hydrating from /auth/me */
  isHydrated: boolean;
  setSession: (token: string, user: AuthUser | User) => void;
  setUser: (user: AuthUser | User | null) => void;
  clear: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  isHydrated: false,

  setSession: (token, user) => {
    persistSession(token, user.role);
    set({
      token,
      user,
      role: user.role,
      isHydrated: true,
    });
  },

  setUser: (user) => {
    if (!user) {
      set({ user: null });
      return;
    }
    const token = getAccessToken();
    if (token) persistSession(token, user.role);
    set({ user, role: user.role });
  },

  clear: () => {
    clearSessionStorage();
    set({
      user: null,
      token: null,
      role: null,
      isHydrated: true,
    });
  },

  hydrateFromStorage: () => {
    const token = getAccessToken();
    const role = getStoredRole();
    set({
      token,
      role,
      isHydrated: true,
      // user is filled after /auth/me (see useAuth)
      user: null,
    });
  },
}));
