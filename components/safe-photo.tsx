"use client";

import { useEffect, useState } from "react";

import { TECHNICIAN_AVATAR_PRESETS } from "@/utils/technician-images";
import { cn } from "@/lib/utils";

const FALLBACK = TECHNICIAN_AVATAR_PRESETS[0].url;

/** Regular img so a missing/invalid photo cannot crash the page via next/image. */
export function SafePhoto({
  src,
  alt = "",
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src?.trim() || FALLBACK);

  useEffect(() => {
    setCurrent(src?.trim() || FALLBACK);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current || FALLBACK}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
    />
  );
}
