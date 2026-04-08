export const dynamic = "force-dynamic";

import Link from "next/link";

import { ADMIN_PAGE_SIZE, listAdminProducts } from "@/lib/admin/products-queries";
import { stripLatinParentheticals } from "@/lib/display-name";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

import { DataTable } from "@/components/admin/data-table";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminFormInput } from "@/components/admin/admin-form-input";

type SearchProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function pick(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function buildQuery(base: Record<string, string | undefined>) {
  const u = new URLSearchParams();
  for (const [k, val] of Object.entries(base)) {
    if (val) u.set(k, val);
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function AdminProductsPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const q = pick(sp.q)?.trim() || undefined;
  const categoryId = pick(sp.categoryId)?.trim() || undefined;
  const brandId = pick(sp.brandId)?.trim() || undefined;
  const status = pick(sp.status)?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(pick(sp.page) || "1", 10) || 1);

  const [categories, brands, { total, rows, page: curPage }] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    listAdminProducts({ q, categoryId, brandId, status, page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const filterBase = { q, categoryId, brandId, status };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Товары</h1>
          <p className="mt-1 hidden text-sm text-zinc-600 sm:block">
            Всего: {total} · Стр. {curPage} из {totalPages}
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#6b5344] bg-[#e8dcc8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-900 shadow-sm transition hover:bg-[#dfc9ae]"
        >
          Добавить товар
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 rounded-[24px] border border-[#d9d2c8] bg-white p-4 md:flex-row md:flex-wrap md:items-end"
      >
        <div className="min-w-[200px] flex-1">
          <AdminFormInput label="Поиск (название, бренд, SKU)" name="q" defaultValue={q ?? ""} placeholder="Например, сумка" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Категория</label>
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="w-full min-w-[160px] rounded-xl border border-[#d9d2c8] bg-white px-3 py-2 text-sm"
          >
            <option value="">Все</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {stripLatinParentheticals(c.name)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Бренд</label>
          <select
            name="brandId"
            defaultValue={brandId ?? ""}
            className="w-full min-w-[160px] rounded-xl border border-[#d9d2c8] bg-white px-3 py-2 text-sm"
          >
            <option value="">Все</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Статус</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full min-w-[140px] rounded-xl border border-[#d9d2c8] bg-white px-3 py-2 text-sm"
          >
            <option value="">Все</option>
            <option value="DRAFT">Черновик</option>
            <option value="ACTIVE">В продаже</option>
            <option value="SOLD_OUT">Нет в наличии</option>
            <option value="ARCHIVED">Архив</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full border-2 border-[#6b5344] bg-[#e8dcc8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-900 shadow-sm hover:bg-[#dfc9ae]"
          >
            Применить
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center rounded-full border border-[#d9d2c8] bg-[#faf8f5] px-4 py-2 text-xs font-medium text-zinc-800"
          >
            Сброс
          </Link>
        </div>
      </form>

      <DataTable>
        <thead>
          <tr className="border-b border-[#ebe6df] text-xs text-zinc-500">
            <th className="px-4 py-3 font-medium">Название</th>
            <th className="px-4 py-3 font-medium">Цена</th>
            <th className="px-4 py-3 font-medium">Бренд</th>
            <th className="px-4 py-3 font-medium">Категория</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium">Дата</th>
            <th className="px-4 py-3 font-medium text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const brandLabel = p.brandRef?.name ?? p.brand;
            const title = `${brandLabel} ${p.name}`.trim();
            return (
              <tr key={p.id} className="border-b border-[#f4f1ec] last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-zinc-900 hover:underline">
                    {title}
                  </Link>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-800">{formatMoney(p.priceMinor, p.currency)}</td>
                <td className="px-4 py-3 text-zinc-700">{brandLabel}</td>
                <td className="px-4 py-3 text-zinc-700">{stripLatinParentheticals(p.category.name)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {p.createdAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} className="text-xs font-medium text-zinc-800 underline-offset-2 hover:underline">
                      Изменить
                    </Link>
                    <ProductDeleteButton id={p.id} label={title} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTable>

      {rows.length === 0 ? <p className="text-sm text-zinc-500">Ничего не найдено — измените фильтры.</p> : null}

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {curPage > 1 ? (
            <Link
              href={`/admin/products${buildQuery({ ...filterBase, page: String(curPage - 1) })}`}
              className="rounded-full border border-[#d9d2c8] bg-white px-4 py-2 text-zinc-800"
            >
              ← Назад
            </Link>
          ) : null}
          <span className="text-zinc-500">
            Стр. {curPage} / {totalPages}
          </span>
          {curPage < totalPages ? (
            <Link
              href={`/admin/products${buildQuery({ ...filterBase, page: String(curPage + 1) })}`}
              className="rounded-full border border-[#d9d2c8] bg-white px-4 py-2 text-zinc-800"
            >
              Вперёд →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
