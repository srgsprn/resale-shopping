export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.credentialUser.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Пользователи</h1>
      <p className="text-sm text-zinc-600">CredentialUser (последние 100). Управление ролями — через БД или отдельный поток.</p>
      <div className="overflow-x-auto rounded-[24px] border border-[#d9d2c8] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#ebe6df] text-xs text-zinc-500">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Имя</th>
              <th className="px-4 py-3 font-medium">Роль</th>
              <th className="px-4 py-3 font-medium">Создан</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#f4f1ec] last:border-0">
                <td className="px-4 py-2 text-zinc-900">{u.email}</td>
                <td className="px-4 py-2 text-zinc-700">{u.name ?? "—"}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800">{u.role}</span>
                </td>
                <td className="px-4 py-2 text-zinc-500">
                  {u.createdAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
