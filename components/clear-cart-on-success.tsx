"use client";

import { useEffect } from "react";

/** После Stripe или ручного оформления очищаем localStorage-корзину на странице успеха. */
export function ClearCartOnSuccess({ shouldClear }: { shouldClear: boolean }) {
  useEffect(() => {
    if (!shouldClear) return;
    try {
      localStorage.setItem("cart", "[]");
      window.dispatchEvent(new Event("resale-cart-updated"));
    } catch {
      /* ignore */
    }
  }, [shouldClear]);
  return null;
}
