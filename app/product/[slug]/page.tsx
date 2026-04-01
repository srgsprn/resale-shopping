export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
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
    <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
      <div>
        <ProductGallery images={product.images} productName={product.name} />
      </div>

      <div className="space-y-5 rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{product.brand}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
        <p className="text-2xl font-semibold text-zinc-900">{formatMoney(product.priceMinor, product.currency)}</p>

        <dl className="grid gap-2 text-sm text-zinc-700">
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe6df] pb-2">
            <dt className="text-zinc-500">Категория</dt>
            <dd className="text-right">{product.category.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe6df] pb-2">
            <dt className="text-zinc-500">Состояние</dt>
            <dd className="text-right">{product.conditionLabel || "Отличное"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe6df] pb-2">
            <dt className="text-zinc-500">Размер</dt>
            <dd className="text-right">{product.size || "Уточняется"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe6df] pb-2">
            <dt className="text-zinc-500">Цвет</dt>
            <dd className="text-right">{product.color || "Уточняется"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe6df] pb-2">
            <dt className="text-zinc-500">Материал</dt>
            <dd className="text-right">{product.material || product.composition || "Уточняется"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-zinc-500">Комплектность</dt>
            <dd className="text-right">{product.completeness || "По запросу"}</dd>
          </div>
        </dl>

        {product.description ? <p className="text-sm leading-relaxed text-zinc-700">{product.description}</p> : null}

        <div className="flex flex-wrap gap-3">
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
          <WishlistToggleButton
            item={{
              id: product.id,
              slug: product.slug,
              brand: product.brand,
              name: product.name,
              priceMinor: product.priceMinor,
              currency: product.currency,
              imageUrl: product.images[0]?.url,
              status: product.status,
            }}
          />
        </div>
      </div>
    </section>
  );
}
