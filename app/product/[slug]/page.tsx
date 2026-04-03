export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductConditionScale } from "@/components/product-condition-scale";
import { ProductGallery } from "@/components/product-gallery";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { decodeHtmlEntities } from "@/lib/html-entities";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, brand: true },
  });
  if (!product) return {};
  const title = decodeHtmlEntities(product.name);
  const brandLine = decodeHtmlEntities(product.brand);
  return {
    title,
    description: `${brandLine} — ${title}`,
  };
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#ebe6df] py-2.5 text-sm last:border-b-0">
      <dt className="shrink-0 text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-900">{value}</dd>
    </div>
  );
}

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

  const displayName = decodeHtmlEntities(product.name);
  const displayBrand = decodeHtmlEntities(product.brand);
  const condition = product.conditionLabel || "Отличное";
  const material = product.material || product.composition || "Уточняется";

  const wishItem = {
    id: product.id,
    slug: product.slug,
    brand: displayBrand,
    name: displayName,
    priceMinor: product.priceMinor,
    currency: product.currency,
    imageUrl: product.images[0]?.url,
    status: product.status,
  };

  const cartProduct = {
    id: product.id,
    slug: product.slug,
    brand: displayBrand,
    name: displayName,
    priceMinor: product.priceMinor,
    currency: product.currency,
    imageUrl: product.images[0]?.url,
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)]">
      <div>
        <ProductGallery images={product.images} productName={displayName} />
      </div>

      <div className="space-y-5 rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{displayName}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Бренд: <span className="text-zinc-800">{displayBrand}</span>
          </p>
        </div>

        <div className="flex items-start justify-between gap-3">
          <p className="text-2xl font-medium text-zinc-400 md:text-[1.65rem]">
            {formatMoney(product.priceMinor, product.currency)}
          </p>
          <WishlistToggleButton item={wishItem} />
        </div>

        <AddToCartButton
          product={cartProduct}
          className="flex w-full justify-center rounded-xl border border-[#c9863c] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 shadow-sm hover:brightness-105"
        />

        <Link
          href="/rassrochka"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-900 transition hover:bg-amber-100"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-[10px] font-bold text-amber-300">
            T
          </span>
          Оформить рассрочку
        </Link>

        <ProductConditionScale value={condition} />

        <div className="border-t border-[#ebe6df] pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-800">
            Информация о товаре
          </h2>
          {product.sku ? (
            <p className="mt-2 text-sm text-zinc-700">
              <span className="text-zinc-500">Артикул:</span> {product.sku}
            </p>
          ) : null}
          <dl className="mt-2">
            <InfoBlock label="Категория" value={product.category.name} />
            <InfoBlock label="Состояние" value={condition} />
            <InfoBlock label="Размер" value={product.size || "Уточняется"} />
            <InfoBlock label="Цвет" value={product.color || "Уточняется"} />
            <InfoBlock label="Материал" value={material} />
            <InfoBlock label="Пол" value={product.gender || "Уточняется"} />
            <InfoBlock label="Комплектность" value={product.completeness || "По запросу"} />
          </dl>
        </div>
      </div>
    </section>
  );
}
