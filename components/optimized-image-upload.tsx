"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadOptimizedImage } from "@/lib/upload-image";
import type { OptimizeImageOptions } from "@/lib/optimize-image";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function OptimizedImageUpload({
  onUploaded,
  optimize,
  label = "Upload image",
  hint = "JPG, PNG, or WebP — compressed automatically before upload.",
  className,
  disabled,
}: {
  onUploaded: (url: string) => void;
  optimize?: OptimizeImageOptions;
  label?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || uploading || disabled) return;
    setUploading(true);
    try {
      const result = await uploadOptimizedImage(file, optimize);
      onUploaded(result.url);
      const savedKb = Math.max(1, Math.round(result.optimizedBytes / 1024));
      const originalKb = Math.max(1, Math.round(result.bytes / 1024));
      toast.success(
        originalKb > savedKb
          ? `Photo ready (${originalKb}KB → ${savedKb}KB)`
          : "Photo ready"
      );
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not upload image"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Optimizing & uploading…
          </>
        ) : (
          <>
            <ImageUp aria-hidden="true" />
            {label}
          </>
        )}
      </Button>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
