import Link from "next/link";

import { ProductImage } from "@/components/product-image";
import { formatMoney } from "@/lib/money";
import { stripResaleShoppingSuffix } from "@/lib/product-name";

export type DiscountProduct = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  priceMinor: number;
  currency: string;
  status: string;
  images: { url: string; alt: string | null }[];
};

/** Без framer-motion/blur — Safari и Telegram WebView их блокируют. */
export function HomeDiscountsSection({ products }: { products: DiscountProduct[] }) {
  return (
    <section className="relative py-14 md:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b5a89a]/50 to-transparent"
        aria-hidden
      />

      <div className="mb-10 md:mb-14 lg:mb-16">
        <p className="font-display text-center text-[clamp(1.85rem,5vw,2.65rem)] font-normal leading-none tracking-[0.02em] text-zinc-900 md:text-left">
          Скидки
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-4 md:gap-x-5 md:gap-y-10 lg:gap-x-6">
        {products.map((product) => {
          const discountedMinor = Math.max(0, Math.round(product.priceMinor * 0.9));
          const displayName = stripResaleShoppingSuffix(product.name);
          return (
            <article key={product.id} className="group">
              <Link
                href={`/product/${product.slug}`}
                className="block outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f3ef]"
              >
                <div className="relative overflow-hidden rounded-md bg-[#e8e4df] sm:rounded-lg md:rounded-xl">
                  <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5] lg:aspect-square">
                    <ProductImage
                      src={product.images[0]?.url}
                      alt={product.images[0]?.alt || displayName}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 px-0.5 md:mt-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500 md:text-[11px] md:tracking-[0.34em]">
                    {product.brand}
                  </p>
                  <h3 className="font-display text-[15px] font-normal leading-snug tracking-tight text-zinc-900 md:text-[1.05rem]">
                    {displayName}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm tabular-nums tracking-tight text-zinc-500 line-through">
                      {formatMoney(product.priceMinor, product.currency)}
                    </p>
                    <p className="text-sm font-medium tabular-nums tracking-tight text-zinc-800">
                      {formatMoney(discountedMinor, product.currency)}
                    </p>
                    <span className="rounded-full bg-[#d94f45]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b02b21]">
                      -10%
                    </span>
                  </div>
                  {product.status === "SOLD_OUT" ? (
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Нет в наличии</p>
                  ) : null}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
