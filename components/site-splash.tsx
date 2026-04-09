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
    return () => {
      document.documentElement.style.overflow = "";
    };
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
  };

  if (!allowRender) return null;

  const fast = Boolean(reduceMotion);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          key="splash"
          className="box-border flex min-h-0 flex-col items-stretch bg-[#c9bdb0]"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            minHeight: "100dvh",
            height: "100dvh",
            width: "100%",
            maxWidth: "100vw",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            boxSizing: "border-box",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fast ? 0.15 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center text-[#1c1917]">
            <div className="overflow-hidden">
              <motion.h1
                className="text-[clamp(2.1rem,7vw,3.4rem)] font-normal leading-[1.05] tracking-[0.2em] md:tracking-[0.28em]"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, y: "90%", filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: fast ? 0.12 : 0.95,
                  delay: fast ? 0 : 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                RESALE SHOPPING
              </motion.h1>
            </div>
            <motion.div
              className="mx-auto mt-5 h-px w-[min(72vw,420px)] origin-left bg-[#1c1917]/75 md:mt-7"
              initial={fast ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: fast ? 0.12 : 0.75, delay: fast ? 0.05 : 1.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
