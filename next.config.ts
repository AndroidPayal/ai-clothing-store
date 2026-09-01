import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.europosters.eu",
      },
      {
        protocol: "https",
        hostname: "i00.eu",
      },
      {
        protocol: "https",
        hostname: "babymonk.co",
      },
      {
        protocol: "https",
        hostname: "outlanddenim.com",
      },
      {
        protocol: "https",
        hostname: "eirenestudio.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
