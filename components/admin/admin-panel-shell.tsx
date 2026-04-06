"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export function AdminPanelShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isLogin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f6f3ef] px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] md:min-h-[80vh]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] bg-[#f6f3ef] md:min-h-[80vh]">
      <AdminSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          menuOpen={mobileNavOpen}
          onMenuToggle={() => setMobileNavOpen((v) => !v)}
        />
        <div className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-6">{children}</div>
      </div>
    </div>
  );
}
