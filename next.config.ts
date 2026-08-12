import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Turbopack's on-disk cache compaction blocks the dev server for minutes on this D: drive,
  // which makes client navigations fail with "Failed to fetch RSC payload".
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
