#!/usr/bin/env bash
# Прокси домена на Next.js (127.0.0.1:3000) + Let's Encrypt.
#
# Сначала в DNS у регистратора:
#   Тип A, имя @ (или resale-shopping.ru), значение = IP VPS
#   Опционально A или CNAME для www → тот же IP / домен
#
# На VPS (Linux, root):
#   DOMAIN=resale-shopping.ru CERTBOT_EMAIL=you@example.com bash scripts/vps-nginx-ssl.sh
#
# Без www в сертификате:  INCLUDE_WWW=0 DOMAIN=... CERTBOT_EMAIL=... bash ...
set -euo pipefail

if [[ "$(uname -s)" == "Darwin" ]]; then
  echo "Запускай только на Linux VPS после ssh." >&2
  exit 1
fi

if [[ "${EUID:-0}" -ne 0 ]]; then
  exec sudo env DOMAIN="${DOMAIN:-}" CERTBOT_EMAIL="${CERTBOT_EMAIL:-}" INCLUDE_WWW="${INCLUDE_WWW:-1}" bash "$0" "$@"
fi

DOMAIN="${DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
INCLUDE_WWW="${INCLUDE_WWW:-1}"

if [[ -z "$DOMAIN" || -z "$CERTBOT_EMAIL" ]]; then
  echo "Задай переменные, например:" >&2
  echo "  DOMAIN=resale-shopping.ru CERTBOT_EMAIL=admin@твой-почта.ru bash scripts/vps-nginx-ssl.sh" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx curl

UPSTREAM="127.0.0.1:3000"
CONF="/etc/nginx/sites-available/resale-shopping"

if [[ "$INCLUDE_WWW" == "1" ]]; then
  SERVER_NAMES="${DOMAIN} www.${DOMAIN}"
else
  SERVER_NAMES="${DOMAIN}"
fi

cat >"$CONF" <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${SERVER_NAMES};

    location / {
        proxy_pass http://${UPSTREAM};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf "$CONF" /etc/nginx/sites-enabled/resale-shopping
if [[ -f /etc/nginx/sites-enabled/default ]]; then
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t
systemctl enable --now nginx
systemctl reload nginx

# Порты 80/443 для certbot и nginx
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw allow 80/tcp >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  ufw --force enable >/dev/null 2>&1 || true
fi

CERTBOT_OK=0
if [[ "$INCLUDE_WWW" == "1" ]]; then
  if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect; then
    CERTBOT_OK=1
  fi
else
  if certbot --nginx -d "$DOMAIN" \
    --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect; then
    CERTBOT_OK=1
  fi
fi

echo ""
if [[ "$CERTBOT_OK" -eq 1 ]]; then
  echo "Готово: https://${DOMAIN}"
else
  echo "HTTP-прокси на порту 80 уже настроен. HTTPS не выдался (часто DNS или порт 80)."
  echo "Проверь: dig +short ${DOMAIN} A  →  IP VPS. Потом вручную:"
  if [[ "$INCLUDE_WWW" == "1" ]]; then
    echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --agree-tos -m ${CERTBOT_EMAIL} --redirect"
  else
    echo "  certbot --nginx -d ${DOMAIN} --agree-tos -m ${CERTBOT_EMAIL} --redirect"
  fi
fi
echo "Убедись, что приложение слушает ${UPSTREAM} (pm2: resale-shopping)."
echo "В .env: NEXT_PUBLIC_SITE_URL=\"https://${DOMAIN}\" (или http:// пока нет SSL)"
