import { getToken } from "next-auth/jwt";
import { isStaffRole } from "@/lib/admin-role";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev-only-insecure-auth-secret-do-not-use-in-prod" : undefined);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";

  /* Редирект со старого домена на новый (технический хостнейм). */
  if (host.includes("alfa-resale.ru")) {
    const url = new URL(request.url);
    url.host = "resale-shopping.ru";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (!authSecret) {
    return new NextResponse("AUTH_SECRET не задан — сессии недоступны.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const secureCookie = request.nextUrl.protocol === "https:";

  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie,
  });

  const role = typeof token?.role === "string" ? token.role : undefined;

  if (path.startsWith("/admin/login")) {
    if (token && isStaffRole(role)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isStaffRole(role)) {
      return new NextResponse("Доступ запрещён. Нужна роль администратора.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.next();
  }

  if (path.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isStaffRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
