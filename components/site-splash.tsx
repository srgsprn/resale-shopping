"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const STORAGE_KEY = "resale-splash-seen";

export function SiteSplash() {
  const reduceMotion = useReducedMotion();
  const [allowRender, setAllowRender] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setAllowRender(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!allowRender) return;
    document.documentElement.style.overflow = "hidden";
  }, [allowRender]);

  useEffect(() => {
    if (!open) return;
    const ms = reduceMotion ? 500 : 2600;
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
          <div className="flex flex-col items-center px-6 text-center text-[#1c1917]">
            <motion.p
              className="mb-6 text-[10px] font-medium uppercase tracking-[0.45em] text-[#3f3a36]/80"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: fast ? 0.05 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Premium resale
            </motion.p>

            <div className="overflow-hidden">
              <motion.h1
                className="text-[clamp(1.75rem,6vw,2.75rem)] font-normal tracking-[0.22em] md:tracking-[0.28em]"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: fast ? 0.05 : 0.85,
                  delay: fast ? 0 : 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                RESALE
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                className="mt-1 text-[clamp(1.75rem,6vw,2.75rem)] font-normal tracking-[0.22em] md:tracking-[0.28em]"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: fast ? 0.05 : 0.85,
                  delay: fast ? 0 : 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                SHOPPING
              </motion.h1>
            </div>

            <motion.div
              className="mt-8 h-px w-[min(12rem,50vw)] origin-center bg-[#1c1917]/25"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: fast ? 0.05 : 0.9,
                delay: fast ? 0 : 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            <motion.p
              className="mt-6 max-w-xs text-xs leading-relaxed tracking-wide text-[#3f3a36]/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: fast ? 0 : 0.95, duration: fast ? 0.05 : 0.6 }}
            >
              resale-shopping.ru
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
