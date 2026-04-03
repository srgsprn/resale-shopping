import Link from "next/link";

const groupedBrands: Array<{ letter: string; brands: string[] }> = [
  { letter: "a", brands: ["Adidas", "Alaia", "Amina Muaddi"] },
  { letter: "b", brands: ["Balenciaga", "Balmain", "Bottega Veneta", "Burberry", "Bvlgari"] },
  { letter: "c", brands: ["Cartier", "Celine", "Chanel", "Chloe", "Chopard", "Christian Dior", "Christian Louboutin"] },
  { letter: "d", brands: ["Dolce & Gabbana"] },
  { letter: "f", brands: ["Fendi"] },
  { letter: "g", brands: ["Givenchy", "Goyard", "Graff", "Gucci"] },
  { letter: "h", brands: ["Hermes", "Hublot"] },
  { letter: "j", brands: ["Jacquemus", "Jimmy Choo", "Jordan"] },
  { letter: "l", brands: ["Loewe", "Loro Piana", "Louis Vuitton"] },
  { letter: "m", brands: ["Mach & Mach", "Maison Margiela", "Manolo Blahnik", "Messika", "Miu Miu", "Moncler"] },
  { letter: "p", brands: ["Patek Philippe", "Philipp Plein", "Polene", "Prada"] },
  { letter: "r", brands: ["Rimowa", "Rolex"] },
  { letter: "s", brands: ["Saint Laurent", "Salvatore Ferragamo", "Schiaparelli"] },
  { letter: "t", brands: ["The Row", "Tiffany & Co", "Tom Ford"] },
  { letter: "v", brands: ["Valentino Garavani", "Van Cleef", "Versace"] },
  { letter: "y", brands: ["Yeezy"] },
];

export default function BrandsPage() {
  return (
    <section className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="p-5 md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Бренды</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-800 md:text-sm">
            Мы работаем с люксовыми брендами и регулярно обновляем ассортимент новыми поступлениями.
          </p>
        </div>
      </section>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#d9d2c8] bg-white p-4">
        {groupedBrands.map((group) => (
          <a
            key={group.letter}
            href={`#letter-${group.letter}`}
            className="rounded-full border border-[#d0c6b9] bg-white px-3 py-1 text-xs uppercase tracking-[0.12em] text-zinc-700"
          >
            {group.letter}
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {groupedBrands.map((group) => (
          <section key={group.letter} id={`letter-${group.letter}`} className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
            <h2 className="text-xl font-semibold uppercase tracking-[0.12em] text-zinc-900">{group.letter}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {group.brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/catalog?brand=${encodeURIComponent(brand)}`}
                  className="rounded-xl border border-[#d9d2c8] bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-[#c7bbac] hover:bg-[#faf8f5]"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
