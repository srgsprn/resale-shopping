import type { Metadata } from "next";

import { RelatedSeoLinks } from "@/components/related-seo-links";
import { PAGE_SEO } from "@/lib/site-seo";

export const metadata: Metadata = PAGE_SEO.contacts;

export default function ContactsPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="p-5 md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Контакты</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-800 md:text-sm">
            Свяжитесь с нами по вопросам покупки и продажи брендовых вещей resale.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Почта</h2>
          <p className="mt-2 text-sm text-zinc-700">
            <a href="mailto:help@resale-shopping.ru" className="underline-offset-4 hover:underline">
              help@resale-shopping.ru
            </a>
          </p>
        </article>
        <article className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Telegram</h2>
          <p className="mt-2 text-sm text-zinc-700">
            <a href="https://t.me/resaleshoppingg" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
              @resaleshoppingg
            </a>
          </p>
        </article>
      </section>

      <RelatedSeoLinks
        items={[
          { href: "/catalog", label: "Каталог" },
          { href: "/pokupka", label: "Как купить" },
          { href: "/delivery", label: "Доставка" },
        ]}
      />
    </div>
  );
}
