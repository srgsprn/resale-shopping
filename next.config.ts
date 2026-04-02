import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "alfa-resale.ru" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "fastimport.ru" },
      { protocol: "https", hostname: "90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru" },
      { protocol: "https", hostname: "img.freepik.com" },
    ],
  },
};

export default nextConfig;
