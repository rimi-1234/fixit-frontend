"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type RegisterRole = "CUSTOMER" | "TECHNICIAN";

export function RoleToggle({
  value,
  onChange,
}: {
  value: RegisterRole;
  onChange: (role: RegisterRole) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Account type"
      className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
    >
      {(
        [
          { id: "CUSTOMER", label: "Customer" },
          { id: "TECHNICIAN", label: "Technician" },
        ] as const
      ).map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            value === option.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === option.id ? (
            <motion.span
              layoutId="role-toggle-pill"
              className="absolute inset-0 rounded-lg bg-background shadow-sm"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
          ) : null}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
