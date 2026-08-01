"use client";

import { useAuthHydration } from "@/hooks/use-auth";

/** Mount once in the root providers tree to hydrate JWT session. */
export function AuthHydrator() {
  useAuthHydration();
  return null;
}
