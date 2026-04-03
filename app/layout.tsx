import type { Metadata, Viewport } from "next";

import { AuthSessionProvider } from "@/components/auth-session-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HomeSplashHost } from "@/components/home-splash-host";
import { MobileNavProgress } from "@/components/mobile-nav-progress";
import { MobileScrollToTop } from "@/components/mobile-scroll-to-top";
import { SellFormProvider } from "@/components/sell-form-context";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#f6f3ef",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://resale-shopping.ru"),
  title: {
    default: "resale-shopping.ru | Premium Resale",
    template: "%s | resale-shopping.ru",
  },
  description: "Каталог брендовых вещей и аксессуаров в эстетике premium resale.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full bg-[#f6f3ef] text-zinc-900 antialiased">
        <AuthSessionProvider>
          <SellFormProvider>
            <HomeSplashHost />
            <Header />
            <MobileScrollToTop />
            <MobileNavProgress />
            <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-6 sm:px-5 md:px-8 md:py-8">{children}</main>
            <Footer />
          </SellFormProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
