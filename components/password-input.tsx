"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
        className={cn(
          "h-11 pr-11 text-sm transition-shadow duration-200 focus-visible:shadow-[0_0_0_4px_oklch(0.47_0.19_264/0.12)]",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
        aria-label={visible ? toggleLabelHide : toggleLabelShow}
        aria-pressed={visible}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={visible ? "hide" : "show"}
            initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 12 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
