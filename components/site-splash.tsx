"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const STORAGE_KEY = "resale-splash-seen";

export function SiteSplash() {
  const reduceMotion = useReducedMotion();
  const [allowRender, setAllowRender] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [open, setOpen] = useState(allowRender);

  useEffect(() => {
    if (!allowRender) return;
    document.documentElement.style.overflow = "hidden";
  }, [allowRender]);

  useEffect(() => {
    if (!open) return;
    const ms = reduceMotion ? 700 : 3000;
    const t = window.setTimeout(() => setOpen(false), ms);
    return () => window.clearTimeout(t);
  }, [open, reduceMotion]);

  const onExitComplete = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setAllowRender(false);
    document.documentElement.style.overflow = "";
  };

  if (!allowRender) return null;

  const fast = Boolean(reduceMotion);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#c9bdb0]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fast ? 0.15 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="px-6 text-center text-[#1c1917]">
            <motion.div
              className="mx-auto mb-7 h-1 w-[min(72vw,320px)] overflow-hidden rounded-full bg-[#1c1917]/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: fast ? 0.1 : 0.25 }}
            >
              <motion.div
                className="h-full rounded-full bg-[#1c1917]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: fast ? 0.5 : 1.15,
                  delay: fast ? 0.02 : 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </motion.div>
            <div className="overflow-hidden">
              <motion.h1
                className="text-[clamp(2.1rem,7vw,3.4rem)] font-normal leading-[1.05] tracking-[0.2em] md:tracking-[0.28em]"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: fast ? 0.12 : 0.9,
                  delay: fast ? 0.08 : 1.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                RESALE SHOPPING
              </motion.h1>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
