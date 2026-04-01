import Link from "next/link";

import { formatMoney } from "@/lib/money";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    brand: string;
    name: string;
    priceMinor: number;
    currency: string;
    status: string;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    images: { url: string; alt: string | null }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#d9d2c8] bg-white transition hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]?.url || "https://placehold.co/800x800/f4f4f5/18181b?text=Resale"}
            alt={product.images[0]?.alt || product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          {product.images[1]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[1].url}
              alt={product.images[1].alt || `${product.name} фото 2`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100"
            />
          ) : null}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{product.brand}</p>
        <h3 className="line-clamp-2 text-[15px] font-medium text-zinc-900">{product.name}</h3>
        <p className="text-sm font-medium text-zinc-800">{formatMoney(product.priceMinor, product.currency)}</p>
        <p className="line-clamp-1 text-xs text-zinc-500">
          {[product.size, product.color, product.material].filter(Boolean).join(" · ") || "Характеристики по запросу"}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          {product.status === "SOLD_OUT" ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Нет в наличии</p>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">В наличии</p>
          )}
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
    </article>
  );
}
