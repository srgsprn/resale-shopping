import type { Metadata } from "next";

import { PAGE_SEO } from "@/lib/site-seo";

export const metadata: Metadata = PAGE_SEO.checkout;

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
