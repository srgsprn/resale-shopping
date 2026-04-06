"use client";

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  pending,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть"
        onClick={onCancel}
        disabled={pending}
      />
      <div className="relative z-10 w-full max-w-md rounded-[24px] border border-[#d9d2c8] bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        {description ? <div className="mt-2 text-sm text-zinc-600">{description}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full border border-[#d9d2c8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-800 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-full border border-red-800 bg-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-50"
          >
            {pending ? "Удаление…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
