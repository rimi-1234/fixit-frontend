"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin, Navigation, Wifi, WifiOff } from "lucide-react";
import { useCustomerTracking } from "@/hooks/use-tracking-socket";

// Leaflet must not run server-side (it requires `window`)
const LeafletMap = dynamic(() => import("./leaflet-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function LiveTrackingMap({ bookingId }: { bookingId: string }) {
  const { location, isOnline, connected } = useCustomerTracking(bookingId);

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          )}
          <span className="text-sm font-medium">
            {isOnline
              ? "Technician is on the way — tracking live"
              : "Waiting for technician to share location…"}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          {connected ? (
            <Wifi className="size-3 text-emerald-500" />
          ) : (
            <WifiOff className="size-3" />
          )}
          {connected ? "Connected" : "Connecting…"}
        </span>
      </div>

      {/* Map frame */}
      <div className="relative h-72 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm sm:h-80">
        {location ? (
          <LeafletMap lat={location.lat} lng={location.lng} />
        ) : (
          /* Placeholder shown while waiting for technician to go live */
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            {/* Animated rings */}
            <div className="relative flex size-16 items-center justify-center">
              <span className="absolute size-16 animate-ping rounded-full bg-primary/10" style={{ animationDuration: "2s" }} />
              <span className="absolute size-11 animate-ping rounded-full bg-primary/15" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
              <div className="relative flex size-10 items-center justify-center rounded-full bg-primary/20">
                <Navigation className="size-5 text-primary" aria-hidden="true" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Map will appear here</p>
              <p className="text-xs text-muted-foreground">
                Once the technician taps &quot;Go live&quot; on their app, you&apos;ll see
                their real-time location on this map.
              </p>
            </div>
            {/* Subtle grid background */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>
        )}
      </div>

      {location && (
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <MapPin className="size-3" aria-hidden="true" />
            Live position
          </span>
          <p className="text-[11px] text-muted-foreground">
            Updated{" "}
            {new Date(location.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
