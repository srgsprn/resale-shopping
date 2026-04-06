import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default function AdminPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
