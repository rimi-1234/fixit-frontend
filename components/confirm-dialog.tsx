"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmTone = "default" | "danger" | "success";

const TONE_STYLES: Record<
  ConfirmTone,
  { iconWrap: string; icon: LucideIcon; confirmVariant: "default" | "destructive" }
> = {
  default: {
    iconWrap: "bg-primary/10 text-primary",
    icon: AlertTriangle,
    confirmVariant: "default",
  },
  danger: {
    iconWrap: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
    confirmVariant: "destructive",
  },
  success: {
    iconWrap: "bg-success/15 text-success",
    icon: CheckCircle2,
    confirmVariant: "default",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const style = TONE_STYLES[tone];
  const Icon = style.icon;

  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md"
      >
        <DialogHeader className="gap-4 p-6 pb-4">
          <div
            className={cn(
              "inline-flex size-12 items-center justify-center rounded-full",
              style.iconWrap
            )}
          >
            <Icon aria-hidden="true" className="size-6" />
          </div>
          <div className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm leading-relaxed">
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </DialogHeader>

        <DialogFooter className="mx-0 mb-0 gap-2 border-t border-border/60 bg-transparent p-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={style.confirmVariant}
            className="rounded-full"
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {loading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
