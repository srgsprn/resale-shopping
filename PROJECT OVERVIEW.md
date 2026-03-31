# PROJECT OVERVIEW

## Что это

`resale-shopping` — storefront на Next.js (App Router) + TypeScript для `resale-shopping.ru`, собранный как миграция с `alfa-resale.ru`.

Ключевые части:
- витрина/каталог/карточка товара;
- корзина в `localStorage` + реактивный бейдж в шапке;
- checkout через форму данных клиента;
- создание заказа в БД до оплаты (pending order);
- оплата через Stripe (если ключи заданы) или fallback на manual flow;
- письмо подтверждения через Resend/SMTP;
- импорт каталога из публичного WordPress API.

## Технологии

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Stripe
- Resend / Nodemailer SMTP
- PM2 + Nginx + Certbot (VPS)

## Важные директории

- `app` — страницы и API routes
- `components` — UI-компоненты (header, discounts, splash и т.д.)
- `lib` — бизнес-логика (orders, stripe, email, cart events)
- `prisma` — схема и сиды
- `scripts` — деплой и синхронизация каталога
- `data` — артефакты/выгрузки синка

## Критичные пользовательские флоу

1. Добавление в корзину:
   - `components/add-to-cart-button.tsx`
   - событие `resale-cart-updated` из `lib/cart-events.ts`
2. Корзина:
   - `app/cart/page.tsx` (рендер картинок + live refresh)
3. Оформление:
   - `app/checkout/page.tsx` (форма клиента)
   - `app/api/checkout/route.ts` (создание pending order, Stripe/manual)
   - `app/api/stripe/webhook/route.ts` (перевод в PAID + email)
4. Успех:
   - `app/checkout/success/page.tsx`
   - `components/clear-cart-on-success.tsx`

## Главные UI-компоненты

- `components/header.tsx`
- `components/header-main-links.tsx`
- `components/header-cart-badge.tsx`
- `components/header-category-nav.tsx`
- `components/home-discounts-section.tsx`
- `components/site-splash.tsx`
- `components/footer.tsx`
- `app/page.tsx`

## Что уже реализовано по требованиям

- Логотип-иконка в шапке вместо текстового бренда
- Иконки wishlist/cart и бейдж количества
- Категории в нижней строке шапки
- Hero с editorial image
- Секция скидок с плавными анимациями
- Splash с одной надписью `RESALE SHOPPING`
- Checkout через форму, не прямой редирект без данных
- Картинки товаров в корзине
- Telegram-цвета в футере
- Удалены лишние упоминания старого брендинга в UI

## Переменные окружения (минимум)

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (или SMTP переменные)

## Быстрые команды

```bash
npm install
npm run db:generate
npm run db:migrate:dev
npm run dev
```

Синк каталога:

```bash
npm run catalog:sync
```

Прод-сборка:

```bash
npm run build
npm start
```

## Деплой (VPS, коротко)

```bash
cd /root/resale-shopping
git pull origin main
npm ci --include=dev
npm run build
PORT=3001 pm2 restart resale-shopping --update-env
```

Nginx + SSL:

```bash
DOMAIN=resale-shopping.ru CERTBOT_EMAIL=you@example.com bash scripts/vps-nginx-ssl.sh
```

## Нюансы для нового агента

- Есть много исторических правок UI: сначала сверяй текущий код в `components/*` и `app/page.tsx`, не опирайся на старые догадки.
- На некоторых машинах нет прямого SSH-доступа к VPS; если деплой нужен, может потребоваться запуск команд локально у пользователя.
- В репозитории может быть вложенная папка `resale-shopping`; рабочий проект находится в корне текущего репо.
