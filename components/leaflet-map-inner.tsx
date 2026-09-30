"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix the default marker icon path that gets broken by webpack bundling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  lat: number;
  lng: number;
}

export default function LeafletMapInner({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom pulsing technician marker
    const pulseIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:36px;height:36px;">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:rgba(59,130,246,0.25);
            animation:pulse-ring 1.8s ease-out infinite;
          "></div>
          <div style="
            position:absolute;inset:6px;border-radius:50%;
            background:#3b82f6;border:3px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          "></div>
        </div>
        <style>
          @keyframes pulse-ring{
            0%{transform:scale(0.8);opacity:1}
            100%{transform:scale(2.2);opacity:0}
          }
        </style>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([lat, lng], { icon: pulseIcon })
      .addTo(map)
      .bindPopup("<b>Technician</b><br>Live location", { offset: [0, -12] });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothly pan and update marker when coordinates change
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const latlng: L.LatLngExpression = [lat, lng];
    markerRef.current.setLatLng(latlng);
    mapRef.current.panTo(latlng, { animate: true, duration: 0.8 });
  }, [lat, lng]);

  return <div ref={containerRef} className="h-full w-full" />;
}
