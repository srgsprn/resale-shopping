import { auth } from "@/auth";

import { isStaffRole } from "@/lib/admin-role";

export { isStaffRole } from "@/lib/admin-role";

/** Для server components / route handlers после прохождения middleware. */
export async function requireStaffSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  if (!isStaffRole(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
