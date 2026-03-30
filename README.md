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

## VPS: один скрипт (проще всего)

На **Ubuntu/Debian VPS** после `ssh` (с поднятым интернетом):

```bash
curl -fsSL https://raw.githubusercontent.com/srgsprn/resale-shopping/main/scripts/vps-one-shot.sh | sudo bash
```

Или уже в клоне репозитория:

```bash
sudo bash scripts/vps-one-shot.sh
```

Скрипт: Node 20 → PostgreSQL → `.env` с `DATABASE_URL` → миграции → импорт каталога → `next build` → PM2.

Потом в `.env` добавь Stripe и Resend/SMTP (оплата и почта).

Если в `.env` случайно остался `prisma+postgres://` (с Mac), на VPS **один раз**:

```bash
cd ~/resale-shopping && git pull && sudo bash scripts/vps-autofix-and-deploy.sh
```

Скрипт сам вычистит мусор, пропишет нормальный `postgresql://...`, применит миграции и соберёт проект.

Ручной вариант по шагам: `scripts/vps-postgres-install.sh` + `scripts/vps-deploy.sh`.

## Required env vars

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` or SMTP vars

