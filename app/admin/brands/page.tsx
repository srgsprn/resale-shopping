export const dynamic = "force-dynamic";

import Link from "next/link";

import { prisma } from "@/lib/prisma";

type BrandRow = { name: string; slug: string | null; fromTable: boolean };

function firstLetter(name: string): string {
  const t = name.trim();
  if (!t) return "#";
  const ch = t[0]!.toUpperCase();
  return /[А-ЯЁ]/.test(ch) || /[A-Z]/.test(ch) ? ch : "#";
}

export default async function AdminBrandsPage() {
  const [tableBrands, distinctProductBrands] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    prisma.product.findMany({
      where: { brand: { not: "" } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const byKey = new Map<string, BrandRow>();
  for (const b of tableBrands) {
    const key = b.name.trim().toLowerCase();
    if (!key) continue;
    byKey.set(key, { name: b.name.trim(), slug: b.slug, fromTable: true });
  }
  for (const p of distinctProductBrands) {
    const name = p.brand.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, { name, slug: null, fromTable: false });
    }
  }

  const all = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  const groups = new Map<string, BrandRow[]>();
  for (const row of all) {
    const L = firstLetter(row.name);
    const list = groups.get(L) ?? [];
    list.push(row);
    groups.set(L, list);
  }
  const sortedLetters = [...groups.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b, "ru");
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Бренды</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Бренды из справочника и из товаров. Клик — каталог с фильтром по названию бренда на витрине.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[24px] border border-[#d9d2c8] bg-white p-4">
        {sortedLetters.map((letter) => (
          <a
            key={letter}
            href={`#brands-${letter === "#" ? "other" : letter}`}
            className="rounded-full border border-[#d0c6b9] bg-[#faf8f5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-800 hover:bg-[#f0ebe3]"
          >
            {letter === "#" ? "0–9" : letter}
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {sortedLetters.map((letter) => {
          const rows = groups.get(letter) ?? [];
          const id = `brands-${letter === "#" ? "other" : letter}`;
          return (
            <section key={letter} id={id} className="scroll-mt-24 rounded-[24px] border border-[#d9d2c8] bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-900">{letter === "#" ? "Прочее" : letter}</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                  <Link
                    key={row.name.toLowerCase()}
                    href={`/catalog?brand=${encodeURIComponent(row.name)}`}
                    className="block rounded-xl border border-[#e5dfd6] bg-[#faf8f5] px-4 py-3 text-sm font-medium text-zinc-900 transition hover:border-[#c4b8a8] hover:bg-white"
                  >
                    {row.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {all.length === 0 ? <p className="text-sm text-zinc-500">Брендов пока нет.</p> : null}
    </div>
  );
}
