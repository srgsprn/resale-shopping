#!/usr/bin/env bash
# Одноразовый запуск на VPS (root): БД, .env, сборка, PM2:3001, nginx+SSL для resale-shopping.ru
set -euo pipefail

APP_DIR="${APP_DIR:-/root/resale-shopping}"
DOMAIN="${DOMAIN:-resale-shopping.ru}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-orders@resale-shopping.ru}"
APP_PORT="${APP_PORT:-3001}"

DBPASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER resale_app WITH PASSWORD '$DBPASS';"

cd "$APP_DIR"
git pull origin main

umask 077
cat > "$APP_DIR/.env" <<ENVEOF
DATABASE_URL="postgresql://resale_app:${DBPASS}@localhost:5432/resale_shopping"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
ORDER_FROM_EMAIL="orders@${DOMAIN}"
RESEND_API_KEY=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
ENVEOF

npm ci --include=dev
export NODE_ENV=production
npx prisma generate
npx prisma migrate deploy
npm run db:import:alfa-json
npm run build

command -v pm2 >/dev/null 2>&1 || npm install -g pm2
pm2 delete resale-shopping 2>/dev/null || true
PORT="$APP_PORT" pm2 start npm --name resale-shopping -- start
pm2 save
command -v pm2 >/dev/null 2>&1 && pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true

UPSTREAM_PORT="$APP_PORT" DOMAIN="$DOMAIN" CERTBOT_EMAIL="$CERTBOT_EMAIL" INCLUDE_WWW=1 bash "$APP_DIR/scripts/vps-nginx-ssl.sh"

echo "=== local app ==="
curl -sI "http://127.0.0.1:${APP_PORT}" | head -8 || true
echo "=== via nginx ==="
curl -sI -H "Host: ${DOMAIN}" http://127.0.0.1 | head -10 || true
