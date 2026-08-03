"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

import { AuthHydrator } from "@/components/auth-hydrator";
import { makeQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* "user" respects prefers-reduced-motion automatically across every animation. */}
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthHydrator />
          {children}
          <Toaster richColors position="top-center" closeButton />
        </QueryClientProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
