import type { Metadata } from "next";

/** Базовый URL витрины — используется в canonical, sitemap и JSON-LD. */
export const SITE_URL = "https://resale-shopping.ru";
export const SITE_NAME = "Resale Shopping";
export const SITE_EMAIL = "help@resale-shopping.ru";

export type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  keywords?: string[];
  ogType?: "website" | "article";
  image?: string;
};

/** Собирает title/description/canonical/OG без дублей с корневым layout. */
export function pageMeta(input: PageMetaInput): Metadata {
  const url = input.path.startsWith("http") ? input.path : input.path;
  const index = input.index !== false;

  return {
    title: { absolute: input.title },
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      locale: "ru_RU",
      type: input.ogType ?? "website",
      siteName: SITE_NAME,
      images: input.image ? [{ url: input.image }] : undefined,
    },
  };
}

/** Индексируемые лендинги: title ~50–60, description ~140–165. */
export const PAGE_SEO = {
  home: pageMeta({
    title: "Купить брендовые вещи resale — магазин Resale Shopping",
    description:
      "Купите брендовые вещи resale и second hand брендовую одежду люкс-домов. Проверка подлинности, каталог сумок и аксессуаров — оформите заказ онлайн.",
    path: "/",
    keywords: ["купить брендовые вещи resale", "second hand брендовая одежда", "магазин resale"],
  }),
  catalog: pageMeta({
    title: "Каталог брендовых вещей resale — купить в магазине",
    description:
      "Каталог брендовых вещей resale: сумки, одежда и аксессуары люкс-брендов. Second hand брендовая одежда с проверкой — выберите лот и оформите заказ.",
    path: "/catalog",
    keywords: ["каталог брендовых вещей", "купить брендовые вещи resale"],
  }),
  about: pageMeta({
    title: "О компании — магазин брендовых вещей resale",
    description:
      "Resale Shopping — магазин брендовых вещей resale в России. Люкс из Европы, уценка до 90% и проверка подлинности. Смотрите каталог и покупайте онлайн.",
    path: "/about",
  }),
  brands: pageMeta({
    title: "Бренды люксовой одежды resale — Chanel, LV, Dior",
    description:
      "Люксовые бренды в магазине resale: Chanel, Louis Vuitton, Dior, Hermes и другие. Купите брендовые вещи и second hand одежду — перейдите в каталог.",
    path: "/brands",
  }),
  pokupka: pageMeta({
    title: "Как купить брендовые вещи resale в магазине",
    description:
      "Как купить брендовые вещи resale в нашем магазине: выбор лота, корзина, оплата и доставка. Second hand брендовая одежда с проверкой подлинности.",
    path: "/pokupka",
  }),
  prodaja: pageMeta({
    title: "Как продать брендовые вещи в resale-магазине",
    description:
      "Продайте брендовые вещи через resale-магазин: проверка, публикация и выплата. Сдайте second hand одежду люкс-брендов — оставьте заявку онлайн.",
    path: "/prodaja",
  }),
  delivery: pageMeta({
    title: "Доставка брендовых вещей resale по всей России",
    description:
      "Доставка брендовых вещей resale по Москве и России, международные отправки и возврат за 3 дня. Купите лот в магазине — получите трек-номер заказа.",
    path: "/delivery",
  }),
  assurance: pageMeta({
    title: "Гарантия подлинности — брендовые вещи resale",
    description:
      "Каждая брендовая вещь resale проходит экспертную проверку подлинности. Купите second hand одежду люкс-брендов с сертификатом — без риска подделки.",
    path: "/assurance",
  }),
  concepcia: pageMeta({
    title: "Концепция магазина брендовых вещей resale",
    description:
      "Как устроен магазин брендовых вещей resale: покупка, продажа и аутентификация. Прозрачный second hand люкс — изучите процесс и перейдите в каталог.",
    path: "/koncepcia",
  }),
  conserj: pageMeta({
    title: "Консьерж: купить брендовые вещи resale под заказ",
    description:
      "Личный байер подберёт брендовые вещи resale в Европе и США. Second hand и новые лоты с проверкой подлинности — оставьте заявку на персональный подбор.",
    path: "/conserj",
  }),
  giftCards: pageMeta({
    title: "Подарочная карта — брендовые вещи resale магазин",
    description:
      "Подарочная карта Resale Shopping: купите брендовые вещи resale в подарок. Электронный сертификат на second hand одежду люкс — оформите заказ онлайн.",
    path: "/gift-cards",
  }),
  newArrivals: pageMeta({
    title: "Новинки брендовых вещей resale — свежие лоты",
    description:
      "Новые поступления брендовых вещей resale: сумки, одежда и аксессуары. Смотрите свежий second hand люкс в магазине и купите лот, пока он в наличии.",
    path: "/new",
  }),
  prodat: pageMeta({
    title: "Продать брендовые вещи — заявка в resale магазин",
    description:
      "Оставьте заявку, чтобы продать брендовые вещи в магазине resale. Оценка, проверка подлинности и публикация second hand одежды — менеджер свяжется с вами.",
    path: "/prodat",
  }),
  contacts: pageMeta({
    title: "Контакты магазина брендовых вещей resale",
    description:
      "Контакты Resale Shopping: напишите на help@resale-shopping.ru или в Telegram. Вопросы по брендовым вещам resale, заказам и продаже — ответим в рабочее время.",
    path: "/contacts",
  }),
  cart: pageMeta({
    title: "Корзина — Resale Shopping",
    description: "Корзина покупок магазина брендовых вещей resale. Проверьте лоты и перейдите к оформлению заказа.",
    path: "/cart",
    index: false,
  }),
  wishlist: pageMeta({
    title: "Избранное — Resale Shopping",
    description: "Сохранённые брендовые вещи resale. Войдите в кабинет, чтобы вернуться к избранным лотам.",
    path: "/wishlist",
    index: false,
  }),
  checkout: pageMeta({
    title: "Оформление заказа — Resale Shopping",
    description: "Оформите заказ на брендовые вещи resale: контакты, доставка и оплата.",
    path: "/checkout",
    index: false,
  }),
  checkoutSuccess: pageMeta({
    title: "Заказ оформлен — Resale Shopping",
    description: "Спасибо за покупку брендовых вещей в магазине resale.",
    path: "/checkout/success",
    index: false,
  }),
  account: pageMeta({
    title: "Личный кабинет — Resale Shopping",
    description: "Профиль, адреса и заказы в магазине брендовых вещей resale.",
    path: "/account",
    index: false,
  }),
  signin: pageMeta({
    title: "Вход в аккаунт — Resale Shopping",
    description: "Войдите в личный кабинет магазина брендовых вещей resale.",
    path: "/auth/signin",
    index: false,
  }),
  admin: pageMeta({
    title: "Админка — Resale Shopping",
    description: "Служебный раздел магазина.",
    path: "/admin",
    index: false,
  }),
} as const;
