"use client";

import { AlertCircle, Loader2, MapPin, MapPinOff, Navigation } from "lucide-react";
import { useTechnicianTracking } from "@/hooks/use-tracking-socket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  bookingId: string;
}

export function TechnicianLocationShare({ bookingId }: Props) {
  const { sharing, error, currentLocation, startSharing, stopSharing } =
    useTechnicianTracking(bookingId);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        sharing
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border/60 bg-muted/30"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            sharing ? "bg-emerald-500/15" : "bg-muted"
          )}
        >
          {sharing ? (
            <Navigation
              className="size-4 fill-emerald-500 text-emerald-500"
              aria-hidden="true"
            />
          ) : (
            <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-semibold leading-snug">
            {sharing ? "Sharing live location" : "Share your location"}
          </p>
          <p className="text-xs text-muted-foreground">
            {sharing
              ? currentLocation
                ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
                : "Acquiring GPS…"
              : "Let the customer track you in real time while you're on the way."}
          </p>
        </div>

        {/* Button */}
        {sharing ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={stopSharing}
          >
            <MapPinOff className="size-3.5" aria-hidden="true" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700"
            onClick={startSharing}
          >
            {false ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Navigation className="size-3.5" aria-hidden="true" />
            )}
            Go live
          </Button>
        )}
      </div>

      {/* Live pulse indicator */}
      {sharing && (
        <div className="mt-3 flex items-center gap-2 border-t border-emerald-500/20 pt-3">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            Customer can see your location live
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
