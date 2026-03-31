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

### Standard update

```bash
cd /root/resale-shopping
git pull origin main
npm ci --include=dev
npm run build
PORT=3001 pm2 restart resale-shopping --update-env
```

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

## Required env vars

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (or SMTP vars)

