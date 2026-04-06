import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Yandex from "next-auth/providers/yandex";

import { prisma } from "@/lib/prisma";

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
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        try {
          const user = await prisma.credentialUser.findUnique({ where: { email } });
          if (!user) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name?.trim() || user.email.split("@")[0] || "Пользователь",
            role: user.role,
            image: user.image ?? undefined,
          };
        } catch {
          return null;
        }
      },
    }),
    ...(hasYandexProvider
      ? [
          Yandex({
            clientId: process.env.AUTH_YANDEX_ID!,
            clientSecret: process.env.AUTH_YANDEX_SECRET!,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if (user.email) token.email = user.email;
        if (user.name !== undefined && user.name !== null) token.name = user.name;
        if (user.image) token.picture = user.image;
        token.role =
          "role" in user && typeof (user as { role?: UserRole }).role === "string"
            ? (user as { role: UserRole }).role
            : "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || token.sub || "";
        if (token.email) session.user.email = token.email as string;
        if (token.name !== undefined) session.user.name = token.name as string | null;
        if (token.picture !== undefined) session.user.image = token.picture as string | null;
        session.user.role = (token.role as UserRole) || "USER";
      }
      return session;
    },
  },
});
