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
  { letter: "v", brands: ["Valentino Garavani", "Van Cleef & Arpels", "Versace"] },
  { letter: "y", brands: ["Yeezy"] },
];

export default function BrandsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-9">
        <h1 className="text-3xl font-semibold tracking-tight">Бренды</h1>
        <p className="mt-3 text-sm text-zinc-700 md:text-base">
          Мы работаем с люксовыми брендами и регулярно обновляем ассортимент новыми поступлениями.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#d9d2c8] bg-[#f8f6f2] p-4">
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
                  className="rounded-xl border border-[#d9d2c8] bg-[#f8f6f2] px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-[#c7bbac] hover:bg-white"
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
