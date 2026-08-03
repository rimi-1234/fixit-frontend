"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { dashboardPathForRole } from "@/lib/auth-token";
import { authService } from "@/service/auth.service";
import type { AuthUser, LoginResult, Role, User } from "@/lib/types";
import type { LoginPayload, RegisterPayload } from "@/service/auth.service";

/**
 * Hydrate session from cookies, then refresh the user via GET /auth/me.
 * Mount once near the root (see AuthHydrator).
 */
export function useAuthHydration() {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) return;

    let cancelled = false;

    authService
      .me()
      .then((user) => {
        if (cancelled) return;
        setSession(token, user);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clear();
          return;
        }
        // Network blip: keep token/role so middleware still works; user stays null.
        setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, token, setSession, setUser, clear]);
}

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  const isAuthenticated = Boolean(token);

  async function login(payload: LoginPayload): Promise<LoginResult> {
    const result = await authService.login(payload);
    setSession(result.accessToken, result.user);
    return result;
  }

  async function register(payload: RegisterPayload): Promise<LoginResult> {
    const result = await authService.register(payload);
    setSession(result.accessToken, result.user);
    return result;
  }

  function logout() {
    clear();
    router.push("/");
    router.refresh();
  }

  function goToDashboard(userOrRole?: AuthUser | User | Role) {
    const nextRole =
      typeof userOrRole === "string"
        ? userOrRole
        : userOrRole?.role ?? role ?? "CUSTOMER";
    router.push(dashboardPathForRole(nextRole));
  }

  return {
    user,
    token,
    role,
    isHydrated,
    isAuthenticated,
    login,
    register,
    logout,
    goToDashboard,
  };
}
