export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Товары</h1>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="py-2">Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100">
                <td className="py-2">{p.brand} {p.name}</td>
                <td>{p.category.name}</td>
                <td>{formatMoney(p.priceMinor, p.currency)}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
