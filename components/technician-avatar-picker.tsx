"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";

import { OptimizedImageUpload } from "@/components/optimized-image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { shouldUnoptimizeImage } from "@/utils/image-src";
import { TECHNICIAN_AVATAR_PRESETS } from "@/utils/technician-images";

export function TechnicianAvatarPicker({
  value,
  onChange,
  error,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const preview = value || TECHNICIAN_AVATAR_PRESETS[0].url;

  return (
    <div className="space-y-3">
      <Label>Profile photo</Label>
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted ring-4 ring-background">
          <Image
            src={preview}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
            unoptimized={shouldUnoptimizeImage(preview)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Upload a portrait or pick a preset customers will see on your public
          profile.
        </p>
      </div>

      <OptimizedImageUpload
        label="Upload profile photo"
        optimize={{ maxWidth: 640, maxHeight: 640, quality: 0.82 }}
        onUploaded={onChange}
        disabled={disabled}
      />

      <div className="grid grid-cols-6 gap-2">
        {TECHNICIAN_AVATAR_PRESETS.map((preset) => {
          const selected = value === preset.url;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.url)}
              disabled={disabled}
              className={cn(
                "relative aspect-square overflow-hidden rounded-full ring-offset-background transition",
                selected
                  ? "ring-2 ring-primary ring-offset-2"
                  : "ring-1 ring-border/70 hover:ring-primary/40"
              )}
              aria-label={preset.label}
              aria-pressed={selected}
            >
              <Image
                src={preset.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="technician-image-url">Or paste image URL</Label>
        <div className="relative">
          <ImagePlus
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="technician-image-url"
            className="h-11 pl-9"
            placeholder="https://… or /avatars/avatar-1.png"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            disabled={disabled}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Upload a photo, pick a preset, or paste any public image link.
          </p>
        )}
      </div>
    </div>
  );
}
