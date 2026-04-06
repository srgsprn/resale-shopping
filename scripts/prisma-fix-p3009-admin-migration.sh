#!/usr/bin/env bash
# Снимает P3009 после сбоя миграции 20260407120000_admin_schema_brand_seo_roles.
# Запуск на VPS из корня репозитория (рядом с .env и prisma/).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Нужен файл .env с DATABASE_URL в $ROOT" >&2
  exit 1
fi

echo "==> 1/4: пометить упавшую миграцию как откатанную"
npx prisma migrate resolve --rolled-back "20260407120000_admin_schema_brand_seo_roles"

echo "==> 2/4: применить идемпотентный SQL (repair)"
npx prisma db execute --file scripts/repair-failed-migration-20260407120000.sql

echo "==> 3/4: пометить миграцию как успешно применённую (без повторного SQL из папки миграции)"
npx prisma migrate resolve --applied "20260407120000_admin_schema_brand_seo_roles"

echo "==> 4/4: остальные миграции"
npx prisma migrate deploy

echo "Готово. Дальше: bash scripts/vps-deploy.sh (или npm run build + pm2 restart)."
