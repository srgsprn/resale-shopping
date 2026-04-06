export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductForAdmin } from "@/lib/admin/products-queries";
import { prisma } from "@/lib/prisma";

import { ProductForm } from "@/components/admin/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductForAdmin(id),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
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
      <ProductForm mode="edit" categories={categories} brands={brands} product={product} />
    </div>
  );
}
