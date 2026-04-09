"use client";

import { useEffect } from "react";

import { SellFormFields } from "@/components/sell-form-fields";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SellFormModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#2d2720]/45 p-4 pt-14 backdrop-blur-[2px] md:items-center md:pt-10">
      <button
        type="button"
        aria-label="Закрыть"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sell-modal-title"
        className="relative z-[101] w-full max-w-lg rounded-[28px] border border-[#d9d2c8] bg-[#faf8f5] p-6 shadow-[0_20px_50px_rgba(45,39,32,0.2)] md:max-w-xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 id="sell-modal-title" className="text-lg font-semibold tracking-tight text-zinc-900 md:text-xl">
            Продать
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d9d2c8] bg-white px-3 py-1 text-sm text-zinc-600 transition hover:bg-[#f0ebe3]"
          >
            Закрыть
          </button>
        </div>
        <SellFormFields bare />
      </div>
    </div>
  );
}
