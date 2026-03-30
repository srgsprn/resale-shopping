import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8] bg-[#f6f3ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
        <Link href="/prodaja" className="hidden rounded-full border border-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] md:inline-block">
          Продать
        </Link>

        <Link href="/" className="text-lg font-semibold tracking-[0.08em] text-zinc-900 md:text-xl">
          RESALE SHOPPING
        </Link>

        <nav className="ml-auto flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-zinc-700 md:gap-6">
          <Link href="/catalog">Каталог</Link>
          <Link href="/wishlist">Избранное</Link>
          <Link href="/cart">Корзина</Link>
        </nav>
      </div>
    </header>
  );
}
