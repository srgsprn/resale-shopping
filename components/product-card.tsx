import Link from "next/link";

import { formatMoney } from "@/lib/money";

type ProductCardProps = {
  product: {
    slug: string;
    brand: string;
    name: string;
    priceMinor: number;
    currency: string;
    status: string;
    images: { url: string; alt: string | null }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-lg">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square w-full bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]?.url || "https://placehold.co/800x800/f4f4f5/18181b?text=Resale"}
            alt={product.images[0]?.alt || product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="space-y-1 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{product.brand}</p>
          <h3 className="line-clamp-2 text-base font-medium text-zinc-900">{product.name}</h3>
          <p className="text-sm text-zinc-700">{formatMoney(product.priceMinor, product.currency)}</p>
          {product.status === "SOLD_OUT" ? (
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Нет в наличии</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
