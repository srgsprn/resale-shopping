"use client";

import { useMemo, useState } from "react";

type Props = {
  minName: string;
  maxName: string;
  initialMin: number;
  initialMax: number;
  lowerBound: number;
  upperBound: number;
};

export function CatalogPriceRange({
  minName,
  maxName,
  initialMin,
  initialMax,
  lowerBound,
  upperBound,
}: Props) {
  const clamp = (v: number) => Math.min(upperBound, Math.max(lowerBound, v));
  const [min, setMin] = useState(clamp(initialMin));
  const [max, setMax] = useState(clamp(initialMax));

  const leftPct = useMemo(() => ((min - lowerBound) / (upperBound - lowerBound)) * 100, [min, lowerBound, upperBound]);
  const rightPct = useMemo(() => ((max - lowerBound) / (upperBound - lowerBound)) * 100, [max, lowerBound, upperBound]);

  const onMinInput = (v: number) => {
    const next = clamp(v);
    setMin(Math.min(next, max));
  };
  const onMaxInput = (v: number) => {
    const next = clamp(v);
    setMax(Math.max(next, min));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          name={minName}
          value={min}
          onChange={(e) => onMinInput(Number.parseInt(e.target.value || "0", 10) || lowerBound)}
          inputMode="numeric"
          className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#a57d58]"
        />
        <input
          name={maxName}
          value={max}
          onChange={(e) => onMaxInput(Number.parseInt(e.target.value || "0", 10) || upperBound)}
          inputMode="numeric"
          className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#a57d58]"
        />
      </div>
      <div className="relative h-7">
        <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[#e4d8c8]" />
        <div
          className="absolute top-3 h-1 rounded-full bg-[#b67b42]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={lowerBound}
          max={upperBound}
          value={min}
          onChange={(e) => onMinInput(Number.parseInt(e.target.value, 10))}
          className="pointer-events-none absolute left-0 top-1 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#d96a17] [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#d96a17]"
        />
        <input
          type="range"
          min={lowerBound}
          max={upperBound}
          value={max}
          onChange={(e) => onMaxInput(Number.parseInt(e.target.value, 10))}
          className="pointer-events-none absolute left-0 top-1 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#d96a17] [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#d96a17]"
        />
      </div>
    </div>
  );
}
