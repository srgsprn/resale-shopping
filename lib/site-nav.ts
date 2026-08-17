import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-seo";

export type SiteNavItem = { label: string; href: string };

/** Разделы шапки — те же ссылки уходят в HTML и в быстрые ссылки поиска. */
export async function getSiteNavItems(): Promise<SiteNavItem[]> {
  const [jewelry, watches] = await Promise.all([
    prisma.category.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: "jewelry" }, { name: { contains: "ювелир", mode: "insensitive" } }],
      },
      select: { slug: true },
    }),
    prisma.category.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: "watches" }, { slug: "watch" }, { name: { contains: "час", mode: "insensitive" } }],
      },
      select: { slug: true },
    }),
  ]);

  const jewelryHref = jewelry ? `/catalog?category=${encodeURIComponent(jewelry.slug)}` : "/catalog";
  const watchesHref = watches ? `/catalog?category=${encodeURIComponent(watches.slug)}` : "/catalog";

  return [
    { label: "Каталог", href: "/catalog" },
    { label: "Новинки", href: "/new" },
    { label: "Ювелирные украшения", href: jewelryHref },
    { label: "Часы", href: watchesHref },
    { label: "Подарочная карта", href: "/gift-cards" },
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
