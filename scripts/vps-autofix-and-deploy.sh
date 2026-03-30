#!/usr/bin/env bash
# Запуск на VPS: sudo bash scripts/vps-autofix-and-deploy.sh
# Сам чинит .env (убирает prisma+postgres, одна строка DATABASE_URL), поднимает Postgres при необходимости,
# запускает миграции и деплой от пользователя, который вызвал sudo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "${EUID:-0}" -ne 0 ]]; then
  exec sudo bash "$0" "$@"
fi

DEPLOY_USER="${SUDO_USER:-}"
if [[ -z "$DEPLOY_USER" || "$DEPLOY_USER" == "root" ]]; then
  DEPLOY_USER="$(logname 2>/dev/null || true)"
fi
if [[ -z "$DEPLOY_USER" ]]; then
  DEPLOY_USER="root"
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

TMP="$(mktemp)"
chmod 600 "$TMP"
trap 'rm -f "$TMP"' EXIT

export RESALE_DB_URL_FILE="$TMP"
bash "$ROOT/scripts/vps-postgres-install.sh"

DB_LINE="$(grep '^DATABASE_URL=' "$TMP" | head -1)"
if [[ -z "$DB_LINE" ]]; then
  echo "Не получилось получить DATABASE_URL после настройки Postgres." >&2
  exit 1
fi

# Убрать все строки DATABASE_URL и любые хвосты prisma+postgres (старый локальный .env)
grep -v '^DATABASE_URL=' .env | grep -v 'prisma+postgres' > .env.tmp
mv .env.tmp .env
echo "$DB_LINE" >> .env

# Если остался localhost в SITE_URL на сервере — подставить IP
if grep -q '^NEXT_PUBLIC_SITE_URL="http://localhost:3000"' .env 2>/dev/null; then
  PUB_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  if [[ -n "$PUB_IP" ]]; then
    grep -v '^NEXT_PUBLIC_SITE_URL=' .env > .env.tmp
    echo "NEXT_PUBLIC_SITE_URL=\"http://${PUB_IP}:3000\"" >> .env.tmp
    mv .env.tmp .env
  fi
fi

if [[ "$DEPLOY_USER" != "root" ]]; then
  chown "$DEPLOY_USER":"$DEPLOY_USER" .env
  sudo -u "$DEPLOY_USER" bash "$ROOT/scripts/vps-deploy.sh"
else
  bash "$ROOT/scripts/vps-deploy.sh"
fi

echo "Готово. Stripe/Resend допиши в .env при необходимости."
