import type { Metadata } from "next";

import { PAGE_SEO } from "@/lib/site-seo";

export const metadata: Metadata = PAGE_SEO.wishlist;

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
