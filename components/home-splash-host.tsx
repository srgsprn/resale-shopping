"use client";

import { usePathname } from "next/navigation";

import { SiteSplash } from "@/components/site-splash";

/** Сплэш только на главной, один раз за сессию (см. SiteSplash). */
export function HomeSplashHost() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <SiteSplash />;
}
