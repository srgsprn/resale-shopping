import type { ComponentProps } from "react";

type Props = ComponentProps<"input"> & {
  label: string;
};

export function AdminFormInput({ label, id, className, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-zinc-600">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-xl border border-[#d9d2c8] bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 ${className ?? ""}`}
        {...rest}
      />
    </div>
  );
}
