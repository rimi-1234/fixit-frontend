"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Strip /api suffix so we connect to the raw Express/Socket.io server
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000"
);

export type TechnicianLocation = {
  bookingId: string;
  lat: number;
  lng: number;
  timestamp: number;
};

// ─── Customer side: receive location ─────────────────────────────────────────
export function useCustomerTracking(bookingId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [location, setLocation] = useState<TechnicianLocation | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-tracking", { bookingId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("technician-location", (data: TechnicianLocation) => {
      setLocation(data);
      setIsOnline(true);
    });

    socket.on("technician-offline", () => {
      setIsOnline(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId]);

  return { location, isOnline, connected };
}

// ─── Technician side: broadcast location ─────────────────────────────────────
export function useTechnicianTracking(bookingId: string) {
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    socketRef.current?.emit("tracking-stopped", { bookingId });
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSharing(false);
    setCurrentLocation(null);
  }, [bookingId]);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError(null);

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-tracking", { bookingId });
    });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCurrentLocation({ lat, lng });
        socket.emit("location-update", { bookingId, lat, lng });
      },
      (err) => {
        setError(err.message);
        stopSharing();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    watchIdRef.current = watchId;
    setSharing(true);
  }, [bookingId, stopSharing]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socketRef.current?.emit("tracking-stopped", { bookingId });
      socketRef.current?.disconnect();
    };
  }, [bookingId]);

  return { sharing, error, currentLocation, startSharing, stopSharing };
}
