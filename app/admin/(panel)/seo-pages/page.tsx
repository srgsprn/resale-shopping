export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminSeoPagesPage() {
  const rows = await prisma.sitePageSEO.findMany({
    orderBy: [{ pageType: "asc" }, { slug: "asc" }],
    take: 200,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">SEO</h1>
      <p className="text-sm text-zinc-600">Записи SitePageSEO (первые 200). Редактор — следующий этап.</p>
      <div className="overflow-x-auto rounded-[24px] border border-[#d9d2c8] bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#ebe6df] text-xs text-zinc-500">
              <th className="px-4 py-3 font-medium">Тип</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Title</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[#f4f1ec] last:border-0">
                <td className="px-4 py-2 text-zinc-700">{r.pageType}</td>
                <td className="px-4 py-2 font-mono text-xs text-zinc-800">{r.slug}</td>
                <td className="px-4 py-2 text-zinc-600">{r.title ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="text-sm text-zinc-500">Записей нет.</p> : null}
    </section>
  );
}
