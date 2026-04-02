"use client";

import { useCallback, useEffect, useState } from "react";

const SHOW_AFTER_PX = 140;

export function MobileScrollToTop() {
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    setVisible(typeof window !== "undefined" && window.scrollY > SHOW_AFTER_PX);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Наверх страницы"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed z-[45] flex h-11 w-11 items-center justify-center rounded-full border border-[#c9b89c] bg-[#faf8f5]/95 text-zinc-800 shadow-[0_4px_14px_rgba(45,39,32,0.12)] backdrop-blur-sm transition hover:border-[#a16f39] hover:bg-white hover:text-zinc-900 md:hidden"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        right: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
        <path
          d="M18 15l-6-6-6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
