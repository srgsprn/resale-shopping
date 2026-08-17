import type { Metadata } from "next";

import { PAGE_SEO } from "@/lib/site-seo";

export const metadata: Metadata = PAGE_SEO.cart;

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
