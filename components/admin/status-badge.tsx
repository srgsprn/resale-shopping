import type { ProductStatus } from "@prisma/client";

const STYLE: Record<ProductStatus, string> = {
  DRAFT: "bg-zinc-200 text-zinc-800",
  ACTIVE: "bg-emerald-100 text-emerald-900",
  SOLD_OUT: "bg-amber-100 text-amber-900",
  ARCHIVED: "bg-zinc-100 text-zinc-500",
};

const LABEL: Record<ProductStatus, string> = {
  DRAFT: "Черновик",
  ACTIVE: "В продаже",
  SOLD_OUT: "Нет в наличии",
  ARCHIVED: "Архив",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STYLE[status]}`}>
      {LABEL[status]}
    </span>
  );
}
