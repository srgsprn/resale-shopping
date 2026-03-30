export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Категории</h1>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        {categories.map((c) => (
          <div key={c.id} className="border-b border-zinc-100 py-2">{c.name} ({c.slug})</div>
        ))}
      </div>
    </section>
  );
}
