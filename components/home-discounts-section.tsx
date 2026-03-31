"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { formatMoney } from "@/lib/money";

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

const easeOut = [0.22, 1, 0.36, 1] as const;

export function HomeDiscountsSection({ products }: { products: DiscountProduct[] }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.08,
      },
    },
  };

  const item = {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 40, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.2 : 0.72, ease: easeOut },
    },
  };

  return (
    <section className="relative py-14 md:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b5a89a]/50 to-transparent"
        aria-hidden
      />

      <div className="mb-10 md:mb-14 lg:mb-16">
        <motion.p
          className="font-display text-center text-[clamp(1.85rem,5vw,2.65rem)] font-normal leading-none tracking-[0.02em] text-zinc-900 md:text-left"
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.62, delay: 0.05, ease: easeOut }}
        >
          Скидки
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px", amount: 0.12 }}
      >
        {products.map((product) => (
          <motion.article
            key={product.id}
            variants={item}
            className="group"
            style={{ willChange: "transform" }}
          >
            <Link href={`/product/${product.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f3ef]">
              <div className="relative overflow-hidden rounded-md bg-[#e8e4df] sm:rounded-lg md:rounded-xl">
                <div className="aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5] lg:aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url || "https://placehold.co/800x1000/f4f4f5/18181b?text=Resale"}
                    alt={product.images[0]?.alt || product.name}
                    className="h-full w-full object-cover transition-[transform,filter] duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:filter group-hover:brightness-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1.5 px-0.5 md:mt-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500 md:text-[11px] md:tracking-[0.34em]">
                  {product.brand}
                </p>
                <h3 className="font-display text-[15px] font-normal leading-snug tracking-tight text-zinc-900 md:text-[1.05rem]">
                  {product.name}
                </h3>
                <p className="text-sm tabular-nums tracking-tight text-zinc-700">{formatMoney(product.priceMinor, product.currency)}</p>
                {product.status === "SOLD_OUT" ? (
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Нет в наличии</p>
                ) : null}
              </div>
            </Link>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
