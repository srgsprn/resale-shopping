import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { PAGE_SEO } from "@/lib/site-seo";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = PAGE_SEO.admin;

/** Не кэшировать HTML админки статически — иначе после релизов возможен закэшированный 404 (x-nextjs-cache: HIT). */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AdminPanelShell>{children}</AdminPanelShell>
      <Toaster richColors position="top-center" closeButton />
    </>
  );
}
