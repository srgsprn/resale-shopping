import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/oferta", destination: "/about", permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "alfa-resale.ru" },
      { protocol: "https", hostname: "resale-shopping.ru" },
      { protocol: "https", hostname: "www.resale-shopping.ru" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "fastimport.ru" },
      { protocol: "https", hostname: "90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru" },
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    ],
  },
};

export default nextConfig;
