"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> & {
  toggleLabelShow?: string;
  toggleLabelHide?: string;
};

export function PasswordInput({
  className,
  toggleLabelShow = "Show password",
  toggleLabelHide = "Hide password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("h-11 pr-11 text-sm", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={visible ? toggleLabelHide : toggleLabelShow}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}
