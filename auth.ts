import NextAuth from "next-auth";
import Yandex from "next-auth/providers/yandex";

const hasYandexProvider = Boolean(process.env.AUTH_YANDEX_ID && process.env.AUTH_YANDEX_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
