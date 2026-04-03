const STEPS = ["Хорошее", "Отличное", "Новое"] as const;

function activeIndex(label: string | null | undefined): number {
  if (!label) return 1;
  const t = label.trim();
  const i = STEPS.findIndex((s) => t === s || t.includes(s));
  return i >= 0 ? i : 1;
}

/** Линейка состояния в духе Alfa, в золотой гамме Resale Shopping. */
export function ProductConditionScale({ value }: { value: string | null | undefined }) {
  const idx = activeIndex(value);

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Состояние</p>
      <div className="relative flex justify-between px-1">
        <div
          className="pointer-events-none absolute left-3 right-3 top-[7px] z-0 h-px bg-zinc-200"
          aria-hidden
        />
        {STEPS.map((label, i) => {
          const on = i === idx;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-2">
              <span
                className={
                  on
                    ? "h-3.5 w-3.5 rounded-full border-2 border-[#c9863c] bg-gradient-to-br from-[#f4c56f] to-[#d89b4f] shadow-sm"
                    : "h-3 w-3 rounded-full border-2 border-zinc-300 bg-white"
                }
              />
              <span
                className={
                  on
                    ? "text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-900"
                    : "text-[10px] uppercase tracking-[0.12em] text-zinc-500"
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
