import type { Metadata } from "next";

import { SellFormFields } from "@/components/sell-form-fields";
import { PAGE_SEO } from "@/lib/site-seo";

export const metadata: Metadata = PAGE_SEO.prodat;

export default function ProdatPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Продать брендовые вещи</h1>
      <p className="text-center text-sm text-zinc-600">
        Заполните форму — менеджер свяжется с вами и подскажет следующие шаги.
      </p>
      <SellFormFields />
    </div>
  );
}
