"use client";

import { useCallback, useState } from "react";

type Props = {
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

export function ImageUploadZone({ onUploaded, disabled }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setErr(null);
      setBusy(true);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const j = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          setErr(j.error || "Ошибка загрузки");
          return;
        }
        if (j.url) onUploaded(j.url);
      } catch {
        setErr("Сеть недоступна");
      } finally {
        setBusy(false);
      }
    },
    [onUploaded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || busy) return;
      const f = e.dataTransfer.files[0];
      if (f) void upload(f);
    },
    [busy, disabled, upload],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) void upload(f);
      e.target.value = "";
    },
    [upload],
  );

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed border-[#d9d2c8] bg-[#faf8f5] px-4 py-8 text-center text-sm ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <p className="text-zinc-700">Перетащите файл сюда или выберите с диска</p>
        <p className="mt-1 text-xs text-zinc-500">JPEG, PNG, WebP, GIF до 8 МБ</p>
        <label className="mt-4 inline-block">
          <span className="cursor-pointer rounded-full border border-zinc-800 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-900">
            {busy ? "Загрузка…" : "Выбрать файл"}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={disabled || busy} onChange={onChange} />
        </label>
      </div>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}
