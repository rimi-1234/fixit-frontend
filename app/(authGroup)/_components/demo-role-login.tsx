"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Loader2,
  Shield,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathForRole } from "@/lib/auth-token";
import type { Role } from "@/lib/types";
import { toastApiError } from "@/utils/toast-api-error";

const DEMO_ROLES: {
  role: Role;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Card surface + icon chip colors */
  tone: string;
}[] = [
  {
    role: "CUSTOMER",
    label: "Customer",
    description: "Book & track jobs",
    icon: UserRound,
    tone:
      "border-sky-500/35 bg-sky-500/12 text-sky-950 hover:bg-sky-500/18 dark:border-sky-400/35 dark:bg-sky-400/15 dark:text-sky-50 dark:hover:bg-sky-400/25",
  },
  {
    role: "TECHNICIAN",
    label: "Technician",
    description: "Manage services",
    icon: Wrench,
    tone:
      "border-amber-500/40 bg-amber-500/12 text-amber-950 hover:bg-amber-500/18 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-50 dark:hover:bg-amber-400/25",
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Platform overview",
    icon: Shield,
    tone:
      "border-violet-500/40 bg-violet-500/12 text-violet-950 hover:bg-violet-500/18 dark:border-violet-400/40 dark:bg-violet-400/15 dark:text-violet-50 dark:hover:bg-violet-400/25",
  },
];

const ICON_TONE: Record<Role, string> = {
  CUSTOMER: "bg-sky-500 text-white shadow-sky-500/30",
  TECHNICIAN: "bg-amber-500 text-white shadow-amber-500/30",
  ADMIN: "bg-violet-500 text-white shadow-violet-500/30",
};

export function DemoRoleLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { demoLogin } = useAuth();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  async function handleDemoLogin(role: Role) {
    setPendingRole(role);
    try {
      const result = await demoLogin({ role });
      toast.success(`Signed in as ${role.toLowerCase()}`);
      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/")
          ? next
          : dashboardPathForRole(result.user.role);
      router.push(destination);
      router.refresh();
    } catch (error) {
      toastApiError(error, "Demo login failed");
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {DEMO_ROLES.map((item, index) => {
        const Icon = item.icon;
        const isPending = pendingRole === item.role;
        const isBusy = pendingRole !== null;

        return (
          <motion.button
            key={item.role}
            type="button"
            disabled={isBusy}
            onClick={() => handleDemoLogin(item.role)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.3 }}
            whileHover={isBusy ? undefined : { y: -2, scale: 1.01 }}
            whileTap={isBusy ? undefined : { scale: 0.98 }}
            className={cn(
              "flex w-full flex-row items-center gap-3 rounded-2xl border px-3.5 py-3 text-left shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-60",
              item.tone
            )}
          >
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-xl shadow-md",
                ICON_TONE[item.role]
              )}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Icon className="size-4" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold tracking-tight">
                {item.label}
              </span>
              <span className="block text-xs opacity-75">{item.description}</span>
            </span>
            <span className="shrink-0 text-xs font-medium opacity-70">
              Try demo
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
