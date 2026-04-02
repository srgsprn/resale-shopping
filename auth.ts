import NextAuth from "next-auth";
import Yandex from "next-auth/providers/yandex";

const hasYandexProvider = Boolean(process.env.AUTH_YANDEX_ID && process.env.AUTH_YANDEX_SECRET);

/**
 * Без secret Auth.js отвечает 500 «Server configuration» на /api/auth/*.
 * В production задайте AUTH_SECRET (openssl rand -base64 32).
 */
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev-only-insecure-auth-secret-do-not-use-in-prod" : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  session: { strategy: "jwt" },
  providers: hasYandexProvider
    ? [
        Yandex({
          clientId: process.env.AUTH_YANDEX_ID!,
          clientSecret: process.env.AUTH_YANDEX_SECRET!,
        }),
      ]
    : [],
  pages: {
    signIn: "/auth/signin",
  },
});
