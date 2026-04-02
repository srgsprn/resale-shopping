import Link from "next/link";

import { auth } from "@/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

async function loadSpotlightProducts() {
  const raw = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 32,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  const onSale = raw.filter((p) => p.compareAtMinor != null && p.compareAtMinor > p.priceMinor).slice(0, 4);
  if (onSale.length >= 4) return onSale;
  const featured = raw.filter((p) => p.isFeatured).slice(0, 4);
  if (featured.length >= 4) return featured;
  return raw.slice(0, 4);
}

function AccountDealCard({
  product,
}: {
  product: {
    slug: string;
    brand: string;
    name: string;
    priceMinor: number;
    compareAtMinor: number | null;
    currency: string;
    images: { url: string; alt: string | null }[];
  };
}) {
  const img = product.images[0]?.url || "https://placehold.co/600x600/f4f4f5/71717a?text=Resale";
  const sale = product.compareAtMinor != null && product.compareAtMinor > product.priceMinor;

  return (
    <article className="overflow-hidden rounded-xl border border-[#d9d2c8] bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square w-full bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={product.images[0]?.alt || product.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-1 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-zinc-900">{product.name}</h3>
          {sale ? (
            <p className="text-sm">
              <span className="text-zinc-400 line-through">{formatMoney(product.compareAtMinor!, product.currency)}</span>{" "}
              <span className="font-semibold text-zinc-900">{formatMoney(product.priceMinor, product.currency)}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-zinc-900">{formatMoney(product.priceMinor, product.currency)}</p>
          )}
        </div>
      </Link>
    </article>
  );
}

export default async function AccountDashboardPage() {
  const session = await auth();
  const deals = await loadSpotlightProducts();
  const rawName = session?.user?.name?.trim();
  const greet = rawName ? rawName.split(/\s+/)[0] : "друг";

  return (
    <section className="rounded-xl border border-[#d9d2c8] bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
        Привет, {greet}! Добро пожаловать в личный кабинет
      </h2>
      <p className="mt-2 text-sm text-zinc-600">Возможно, вам понравятся товары со скидкой и новинки витрины.</p>

      {deals.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">Скоро здесь появятся персональные рекомендации. А пока загляните в каталог.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {deals.map((p) => (
            <AccountDealCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <Link
        href="/catalog"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
      >
        В каталог
      </Link>
    </section>
  );
}
