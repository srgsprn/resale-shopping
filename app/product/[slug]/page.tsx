export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]?.url || "https://placehold.co/1000x1200/f4f4f5/18181b?text=Resale"}
          alt={product.images[0]?.alt || product.name}
          className="w-full rounded-2xl border border-zinc-200 bg-white object-cover"
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">{product.brand}</p>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-xl">{formatMoney(product.priceMinor, product.currency)}</p>
        <p className="text-sm text-zinc-600">Состояние: {product.conditionLabel || "Уточняется"}</p>
        <p className="text-sm text-zinc-600">Категория: {product.category.name}</p>
        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            brand: product.brand,
            name: product.name,
            priceMinor: product.priceMinor,
            currency: product.currency,
            imageUrl: product.images[0]?.url,
          }}
        />
      </div>
    </section>
  );
}
