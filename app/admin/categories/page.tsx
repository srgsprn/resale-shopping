export const dynamic = "force-dynamic";

import Link from "next/link";

import { stripLatinParentheticals } from "@/lib/display-name";
import { prisma } from "@/lib/prisma";

import { DataTable } from "@/components/admin/data-table";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Категории</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ссылки ведут в каталог на сайте с фильтром по категории. Название без английских скобок — только для отображения.
        </p>
      </div>

      <DataTable>
        <thead>
          <tr className="border-b border-[#ebe6df] text-xs text-zinc-500">
            <th className="px-4 py-3 font-medium">Название</th>
            <th className="px-4 py-3 font-medium">Товаров</th>
            <th className="px-4 py-3 font-medium">На сайте</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => {
            const displayName = stripLatinParentheticals(c.name);
            const catalogHref = `/catalog?category=${encodeURIComponent(c.slug)}`;
            return (
              <tr key={c.id} className="border-b border-[#f4f1ec] last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-900">{displayName}</span>
                  {!c.isActive ? (
                    <span className="ml-2 text-xs text-amber-800">(скрыта)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-800">{c._count.products}</td>
                <td className="px-4 py-3">
                  <Link
                    href={catalogHref}
                    className="text-sm font-medium text-[#6b5344] underline-offset-2 hover:underline"
                  >
                    Открыть каталог →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTable>

      {categories.length === 0 ? <p className="text-sm text-zinc-500">Категорий нет.</p> : null}
    </div>
  );
}
