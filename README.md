# resale-shopping

Next.js storefront for `resale-shopping.ru` with catalog, cart, checkout, Stripe, email notifications, and Prisma/PostgreSQL.

## TL;DR For New Agent

- Open `PROJECT OVERVIEW.md` first for architecture and current state.
- Main UI entrypoints: `app/page.tsx`, `components/header*.tsx`, `components/home-discounts-section.tsx`.
- Checkout flow: `app/checkout/page.tsx` -> `app/api/checkout/route.ts` -> `app/api/stripe/webhook/route.ts`.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate:dev
npm run db:seed
npm run dev
```

## Core scripts

```bash
# full catalog sync (scrape + import)
npm run catalog:sync

# production build
npm run build
npm start
```

## Catalog import options

### 1) Public WordPress sync

If there is no legacy CSV/media export, use public sync:

```bash
npm run db:sync:alfa
```

### 2) WooCommerce CSV import (optional)

```bash
npm run db:import:woo -- data/woocommerce-products.csv
```

## Deploy (VPS)

Команды **`npm run db:generate`** и **`npm run build`** нужно запускать **только в корне репозитория** (где лежит `package.json` с `"name": "resale-shopping"`), не из домашней папки `~`.

### Standard update (рекомендуется)

Из любого места на сервере, если репо лежит в `/root/resale-shopping` или `/var/www/resale-shopping`:

```bash
bash /root/resale-shopping/scripts/vps-pull-and-deploy.sh
```

Или явно указать каталог:

```bash
REPO_DIR=/var/www/resale-shopping bash /var/www/resale-shopping/scripts/vps-pull-and-deploy.sh
```

Либо вручную:

```bash
cd /root/resale-shopping
git pull origin main
bash scripts/vps-deploy.sh
```

Скрипт `scripts/vps-deploy.sh` делает `npm ci`, `prisma generate`, `migrate deploy`, `next build` и при наличии процесса **resale-shopping** в PM2 выполняет `pm2 restart`. Тяжёлый импорт каталога по умолчанию **выключен**; однократно: `RUN_ALFA_IMPORT=1 bash scripts/vps-deploy.sh`.

Порт для приложения (например **3001**), как раньше:

```bash
PORT=3001 pm2 restart resale-shopping --update-env
```

### Prisma P3009: упала миграция `20260407120000_admin_schema_brand_seo_roles`

Пока в `_prisma_migrations` висит **failed**, `migrate deploy` дальше не пойдёт. Из корня репо (с рабочим `.env`):

```bash
bash scripts/prisma-fix-p3009-admin-migration.sh
```

Скрипт откатывает запись о сбое, накатывает идемпотентный SQL из `scripts/repair-failed-migration-20260407120000.sql`, помечает миграцию применённой и снова вызывает `migrate deploy`. После этого снова `bash scripts/vps-deploy.sh`.

### Учётка админа по логину

После `prisma migrate deploy` один раз (или после смены пароля):

```bash
npm run admin:ensure
```

По умолчанию: логин **`admin`**, пароль **`ilovepringles`**, служебный email **`admin@resale-shopping.local`**. Задайте в `.env`: `ADMIN_LOGIN`, `ADMIN_PASSWORD`, при необходимости `ADMIN_EMAIL`.

### Bootstrap from scratch

```bash
sudo bash scripts/vps-one-shot.sh
```

## Domain + SSL

```bash
cd ~/resale-shopping && git pull
DOMAIN=resale-shopping.ru CERTBOT_EMAIL=you@example.com bash scripts/vps-nginx-ssl.sh
```

If you do not use `www`:

```bash
INCLUDE_WWW=0 DOMAIN=resale-shopping.ru CERTBOT_EMAIL=you@example.com bash scripts/vps-nginx-ssl.sh
```

## Почта (Resend): пошагово на VPS

Сайт отправляет письма после оформления заказа через [Resend](https://resend.com/). Без API-ключа и **подтверждённого домена** письма клиентам не дойдут (или будут отклоняться API).

### Шаг 1. Аккаунт и API-ключ

1. Зайдите на [resend.com](https://resend.com/), создайте аккаунт.
2. В панели: **API Keys** → **Create API Key**, скопируйте ключ вида `re_...`.
3. На VPS в каталоге проекта откройте `.env` (тот же файл, что и для `DATABASE_URL`).

### Шаг 2. Подключение домена `resale-shopping.ru`

1. В Resend: **Domains** → **Add Domain** → укажите `resale-shopping.ru`.
2. Resend покажет **DNS-записи** (обычно несколько TXT и иногда MX для bounce).
3. В панели регистратора домена (где куплен `resale-shopping.ru`) добавьте эти записи **точно** как в инструкции Resend.
4. Подождите распространения DNS (от нескольких минут до 24–48 ч) и нажмите **Verify** в Resend, пока статус не станет **Verified**.

Без этого шага отправка с адреса `@resale-shopping.ru` будет отклоняться.

### Шаг 3. Переменные в `.env` на сервере

Добавьте или обновите строки (пример):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# Отправитель с подтверждённого домена (рекомендуется явно задать):
RESEND_FROM=Resale Shopping <orders@resale-shopping.ru>

# Дублирует смысл, если RESEND_FROM не задан — тоже поддерживается:
ORDER_FROM_EMAIL=Resale Shopping <orders@resale-shopping.ru>

# Куда клиент нажмёт «Ответить» (необязательно):
ORDER_REPLY_TO_EMAIL=help@resale-shopping.ru
```

Адрес в `RESEND_FROM` / `ORDER_FROM_EMAIL` должен быть **на том домене**, который вы верифицировали в Resend (например `orders@`, `noreply@` — как настроите в DNS/Resend).

### Шаг 4. Перезапуск приложения

После сохранения `.env`:

```bash
cd /root/resale-shopping
# путь замените на ваш, если проект в другом месте
npm run build
PORT=3001 pm2 restart resale-shopping --update-env
```

`--update-env` нужен, чтобы PM2 подхватил новые переменные окружения.

### Шаг 5. Проверка

1. Оформите тестовый заказ с **реальным** почтовым ящиком.
2. Смотрите логи: `pm2 logs resale-shopping` — при успехе будет строка вида `[email] Resend OK id=...`.
3. В Resend: **Emails** / **Logs** — видно доставку и ошибки.

Если писем нет — сначала смотрите логи Resend и PM2, чаще всего причина: домен не verified, неверный `from`, или нет `RESEND_API_KEY` в `.env` на сервере.

## Required env vars

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (or SMTP vars)
- `RESEND_FROM` or `ORDER_FROM_EMAIL` (verified domain in Resend for production mail)

