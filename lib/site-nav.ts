import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-seo";

export type SiteNavItem = { label: string; href: string };

/** Разделы для меню и быстрых ссылок в поиске (как у alfa-resale). */
export async function getSiteNavItems(): Promise<SiteNavItem[]> {
  const jewelry = await prisma.category.findFirst({
    where: { isActive: true, OR: [{ slug: "jewelry" }, { name: { contains: "ювелир", mode: "insensitive" } }] },
    select: { slug: true },
  });
  const jewelryHref = jewelry ? `/catalog?category=${encodeURIComponent(jewelry.slug)}` : "/catalog";

  return [
    { label: "Каталог", href: "/catalog" },
    { label: "Ювелирные украшения", href: jewelryHref },
    { label: "Бренды", href: "/brands" },
    { label: "Новинки", href: "/new" },
    { label: "Контакты", href: "/contacts" },
  ];
}

export function siteNavJsonLd(items: SiteNavItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Разделы сайта",
    itemListElement: items.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.label,
      url: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}
