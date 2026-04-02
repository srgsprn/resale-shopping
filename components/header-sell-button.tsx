"use client";

import { useSellForm } from "@/components/sell-form-context";

export function HeaderSellButton() {
  const { openSellForm } = useSellForm();

  return (
    <button
      type="button"
      onClick={openSellForm}
      className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#c4b5a4] bg-gradient-to-r from-[#efe6db] to-[#dcc9b5] px-4 text-[11px] font-semibold tracking-[0.06em] text-[#3d342c] shadow-sm transition hover:from-[#f2ebe3] hover:to-[#e2d2c0] md:px-5 md:text-xs"
    >
      Продать
    </button>
  );
}
