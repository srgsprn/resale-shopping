import Link from "next/link";

type Item = { href: string; label: string };

/** Внутренняя перелинковка: компактный блок без смены дизайна секций. */
export function RelatedSeoLinks({ items }: { items: readonly Item[] }) {
  if (!items.length) return null;
  return (
    <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-700" aria-label="Связанные страницы">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="underline-offset-4 hover:underline">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
