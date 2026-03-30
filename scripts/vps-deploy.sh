#!/usr/bin/env bash
# Run on VPS from project root after PostgreSQL is ready and .env exists.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Create .env from .env.example and set DATABASE_URL (and Stripe/Resend)." >&2
  exit 1
fi

# Tailwind/PostCSS в devDependencies — для next build на VPS нужны все пакеты
npm ci --include=dev

export NODE_ENV="${NODE_ENV:-production}"
npm run db:generate
npx prisma migrate deploy
npm run db:import:alfa-json
npm run build

echo "Start with: npm run start"
echo "Or use PM2/systemd — see README."
