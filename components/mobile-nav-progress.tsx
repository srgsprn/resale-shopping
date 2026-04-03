"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function MobileNavProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    setLoading(false);
  }, [routeKey]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.toLowerCase().startsWith("javascript:")) return;
      if (el.getAttribute("target") === "_blank" || el.hasAttribute("download")) return;
      if (el.getAttribute("aria-disabled") === "true") return;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const nextKey = `${url.pathname}${url.search}`;
      const curKey = `${window.location.pathname}${window.location.search}`;
      if (nextKey === curKey) return;

      setLoading(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-live="polite"
    >
      <div
        className={`h-[2px] w-full overflow-hidden bg-[#2d2720]/[0.07] transition-opacity duration-200 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      >
        {loading ? (
          <div className="mobile-nav-progress-bar h-full w-[38%] max-w-[200px] rounded-full bg-gradient-to-r from-[#8f6b42] via-[#d4af37] to-[#8f6b42]" />
        ) : null}
      </div>
    </div>
  );
}

export function MobileNavProgress() {
  return (
    <Suspense fallback={null}>
      <MobileNavProgressInner />
    </Suspense>
  );
}
