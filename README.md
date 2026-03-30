# resale-shopping

Production-ready e-commerce baseline for premium resale migration.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate:dev
npm run db:seed
npm run dev
```

## Automatic migration from alfa-resale.ru

If you do not have original CSV/images, run automatic sync from public WordPress endpoints:

```bash
npm run db:sync:alfa
```

What it does:
- pulls categories and products from `wp-json/wp/v2`
- resolves brands from `pwb-brand`
- scrapes product pages for price and gallery images
- stores landing page content snapshots for key pages
- generates `data/redirect-map.json` for 301 mapping

## Import products from WooCommerce CSV (optional)

1. In WordPress admin open `WooCommerce -> Products -> Export`.
2. Enable export of all columns and metadata.
3. Save CSV into `data/woocommerce-products.csv`.
4. Run:

```bash
npm run db:import:woo -- data/woocommerce-products.csv
```

## VPS (Timeweb / любой Ubuntu): Postgres на сервере

На VPS **один раз** (под `root` или `sudo`):

```bash
git clone <твой-репо> resale-shopping && cd resale-shopping
sudo bash scripts/vps-postgres-install.sh
```

Скопируй выведенный `DATABASE_URL` в `.env` (создай из `.env.example`).

Дальше деплой приложения на **этой же** машине:

```bash
cp .env.example .env
# заполни DATABASE_URL, NEXT_PUBLIC_SITE_URL, Stripe, Resend/SMTP
bash scripts/vps-deploy.sh
```

Скрипт выполнит: `npm ci`, миграции Prisma, импорт `data/alfa-products.json` + `data/alfa-pages.json`, `next build`.

Запуск: `npm run start` (порт 3000) или оберни в PM2/systemd + nginx.

## Required env vars

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` or SMTP vars

