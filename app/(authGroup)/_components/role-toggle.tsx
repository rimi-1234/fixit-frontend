"use client";

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
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            value === option.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
