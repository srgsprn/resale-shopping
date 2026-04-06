"use client";

import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export function AdminPanelShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");

  if (isLogin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f6f3ef] px-4 py-12 md:min-h-[80vh]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#f6f3ef] md:min-h-[80vh]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col pt-14 md:pt-0">
        <AdminTopbar />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
