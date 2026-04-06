import type { UserRole } from "@prisma/client";

const STAFF_ROLES: ReadonlySet<UserRole> = new Set(["ADMIN", "MANAGER", "EDITOR"]);

/** Без импорта auth/prisma — безопасно для Edge middleware. */
export function isStaffRole(role: UserRole | string | undefined | null): boolean {
  if (!role) return false;
  return STAFF_ROLES.has(role as UserRole);
}
