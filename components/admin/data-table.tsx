import type { ReactNode } from "react";

import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className }: Props) {
  return (
    <div className={clsx("overflow-x-auto rounded-[24px] border border-[#d9d2c8] bg-white", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}
