import type { Metadata } from "next";

import { PAGE_SEO } from "@/lib/site-seo";

export const metadata: Metadata = PAGE_SEO.giftCards;

export default function GiftCardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
