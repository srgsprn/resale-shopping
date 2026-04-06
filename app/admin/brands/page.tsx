export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Бренды</h1>
      <p className="text-sm text-zinc-600">
        Справочник брендов. CRUD для брендов можно добавить следующим шагом; сейчас только просмотр.
      </p>
      <div className="rounded-[24px] border border-[#d9d2c8] bg-white p-4">
        {brands.map((b) => (
          <div key={b.id} className="border-b border-[#f4f1ec] py-2 text-sm last:border-0">
            <span className="font-medium text-zinc-900">{b.name}</span>{" "}
            <span className="text-zinc-500">({b.slug})</span>
          </div>
        ))}
        {brands.length === 0 ? <p className="text-sm text-zinc-500">Брендов нет.</p> : null}
      </div>
    </section>
  );
}
