"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "resale-splash-seen";

function isSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPR|Android/i.test(ua);
}

/** Сплэш без blur/framer-motion — Safari Private Browsing их блокирует. */
export function SiteSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isSafari()) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return;
    }
    if (seen) return;

    setVisible(true);
    document.documentElement.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      setVisible(false);
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* private mode */
      }
    }, 1800);

    return () => {
      window.clearTimeout(timer);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#c9bdb0] px-6 text-center text-[#1c1917] animate-[splash-out_1.8s_ease-out_forwards]"
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-hidden
    >
      <h1
        className="text-[clamp(2.1rem,7vw,3.4rem)] font-normal leading-[1.05] tracking-[0.2em] md:tracking-[0.28em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        RESALE SHOPPING
      </h1>
      <div className="mx-auto mt-5 h-px w-[min(72vw,420px)] bg-[#1c1917]/75 md:mt-7" />
    </div>
  );
}
