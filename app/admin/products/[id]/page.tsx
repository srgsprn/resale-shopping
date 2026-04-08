export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductForAdmin } from "@/lib/admin/products-queries";
import { prisma } from "@/lib/prisma";

import { ProductForm } from "@/components/admin/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, brands, productBrands] = await Promise.all([
    getProductForAdmin(id),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: { brand: { not: "" } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Редактирование</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {product.brand} {product.name}
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
          >
            ← К списку
          </Link>
        </div>
        <div className="flex justify-center">
          <Link
            href={`/product/${product.slug}`}
            className="rounded-full border border-[#c4b8a8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-800"
          >
            Перейти к товару
          </Link>
        </div>
      </div>
      <ProductForm
        mode="edit"
        categories={categories}
        brands={[
          ...brands,
          ...productBrands
            .map((r) => r.brand.trim())
            .filter((name) => name && !brands.some((b) => b.name.toLowerCase() === name.toLowerCase()))
            .map((name) => ({ id: `name:${name}`, name })),
        ]}
        product={product}
      />
    </div>
  );
}
