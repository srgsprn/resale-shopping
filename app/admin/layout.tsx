import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AdminPanelShell>{children}</AdminPanelShell>
      <Toaster richColors position="top-center" closeButton />
    </>
  );
}
