import { AdminToolbar } from "@/components/admin-toolbar";

export function AdminTopbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#d9d2c8] bg-white/90 px-4 backdrop-blur md:px-6">
      <p className="text-sm text-zinc-500">Панель управления</p>
      <AdminToolbar />
    </header>
  );
}
