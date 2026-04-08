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
import { stripResaleShoppingSuffix } from "@/lib/product-name";
import { buildProductSeo } from "@/lib/product-seo";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      shortName: true,
      brand: true,
      conditionLabel: true,
      color: true,
      material: true,
      gender: true,
      priceMinor: true,
      currency: true,
      category: { select: { name: true, slug: true } },
    },
  });
  if (!product) return {};
  const displayName = stripResaleShoppingSuffix(decodeHtmlEntities(product.name));
  const displayBrand = decodeHtmlEntities(product.brand);

  const normalizedName = stripResaleShoppingSuffix(product.name);

  if (product.slug.startsWith("gift-card")) {
    return {
      title: displayName,
      description: `Подарочная карта Resale Shopping — ${displayBrand}. Номинал ${formatMoney(product.priceMinor, product.currency)}.`,
      keywords: ["подарочная карта", "сертификат Resale Shopping", "люкс ресейл"],
      alternates: { canonical: `/product/${slug}` },
      openGraph: {
        title: displayName,
        description: `Электронная подарочная карта ${displayBrand} на resale-shopping.ru`,
        url: `/product/${slug}`,
        locale: "ru_RU",
        type: "website",
      },
    };
  }

  const seo = buildProductSeo({
    slug: product.slug,
    name: normalizedName,
    shortName: product.shortName,
    brand: product.brand,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    conditionLabel: product.conditionLabel,
    color: product.color,
    material: product.material,
    gender: product.gender,
    priceMinor: product.priceMinor,
    currency: product.currency,
  });

  return {
    title: { absolute: `${seo.metaTitle} | resale-shopping.ru` },
    description: seo.metaDescription,
    keywords: seo.keywords,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: `/product/${slug}`,
      locale: "ru_RU",
      type: "website",
    },
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

  const displayName = stripResaleShoppingSuffix(decodeHtmlEntities(product.name));
  const displayBrand = decodeHtmlEntities(product.brand);
  const condition = product.conditionLabel || "Отличное";
  const material = product.material || product.composition || "Уточняется";

  const seo = product.slug.startsWith("gift-card")
    ? null
    : buildProductSeo({
        slug: product.slug,
        name: stripResaleShoppingSuffix(product.name),
        shortName: product.shortName,
        brand: product.brand,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
        conditionLabel: product.conditionLabel,
        color: product.color,
        material: product.material,
        gender: product.gender,
        priceMinor: product.priceMinor,
        currency: product.currency,
      });
  const displayH1 = stripResaleShoppingSuffix(decodeHtmlEntities(seo?.h1 ?? displayName));

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
    <>
      <nav
        className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 md:text-sm"
        aria-label="Хлебные крошки"
      >
        <Link href="/" className="text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline">
          Главная
        </Link>
        <span className="text-zinc-400" aria-hidden>
          /
        </span>
        <Link
          href="/catalog"
          className="text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline"
        >
          Каталог
        </Link>
        <span className="text-zinc-400" aria-hidden>
          /
        </span>
        <Link
          href={`/catalog?category=${encodeURIComponent(product.category.slug)}`}
          className="text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline"
        >
          {product.category.name}
        </Link>
        <span className="text-zinc-400" aria-hidden>
          /
        </span>
        <span className="text-zinc-500">{displayName}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)]">
        <div>
          <ProductGallery images={product.images} productName={displayName} />
        </div>

        <div className="space-y-5 rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-7">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              {displayH1}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Бренд: <span className="text-zinc-800">{displayBrand}</span>
              {seo && displayName !== displayH1 ? (
                <>
                  {" "}
                  <span className="text-zinc-500">·</span>{" "}
                  <span className="text-zinc-700">{displayName}</span>
                </>
              ) : null}
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

      {seo ? (
        <aside
          className="mt-10 border-t border-[#e5dfd6] pt-8 text-sm leading-relaxed text-zinc-600"
          aria-label="Дополнительное описание"
        >
          {seo.microcopyParagraphs.length ? (
            <div className="space-y-3 text-zinc-700">
              {seo.microcopyParagraphs.map((p, i) => (
                <p key={`mc-${i}-${product.slug}`}>{p}</p>
              ))}
            </div>
          ) : null}
          <p className={seo.microcopyParagraphs.length ? "mt-5" : ""}>{seo.footerParagraph}</p>
        </aside>
      ) : null}
    </>
  );
}
