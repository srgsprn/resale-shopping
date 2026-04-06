export const dynamic = "force-dynamic";

import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { ProductForm } from "@/components/admin/product-form";

export default async function AdminProductAddPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Новый товар</h1>
          <p className="mt-1 text-sm text-zinc-600">Slug подставится автоматически, если оставить поле пустым.</p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
        >
          ← К списку
        </Link>
      </div>
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
