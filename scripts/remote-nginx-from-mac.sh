#!/usr/bin/env bash
# С твоего Mac: один запуск, всё на VPS по SSH (git pull → nginx+прокси → certbot → проверки).
#
# Нужен рабочий вход по SSH (ключ в ssh-agent или в ~/.ssh).
#
#   VPS_SSH=root@85.239.51.175 CERTBOT_EMAIL=you@domain.ru bash scripts/remote-nginx-from-mac.sh
#
# Если репозиторий не в /var/www/resale-shopping:
#   INSTALL_DIR=~/resale-shopping VPS_SSH=...
#
# Домен по умолчанию resale-shopping.ru (переопредели DOMAIN=... при необходимости).
set -euo pipefail

VPS_SSH="${VPS_SSH:-}"
DOMAIN="${DOMAIN:-resale-shopping.ru}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
INSTALL_DIR="${INSTALL_DIR:-/var/www/resale-shopping}"

if [[ -n "${1:-}" && "$1" != -* ]]; then
  VPS_SSH="$1"
fi

if [[ -z "$VPS_SSH" ]]; then
  echo "Задай VPS_SSH, например root@IP_сервера" >&2
  echo "  VPS_SSH=root@85.239.51.175 CERTBOT_EMAIL=admin@site.ru bash scripts/remote-nginx-from-mac.sh" >&2
  exit 1
fi

if [[ -z "$CERTBOT_EMAIL" ]]; then
  echo "Нужна CERTBOT_EMAIL для Let's Encrypt." >&2
  exit 1
fi

exec ssh -o BatchMode=yes "$VPS_SSH" bash -s -- "$INSTALL_DIR" "$DOMAIN" "$CERTBOT_EMAIL" <<'REMOTE'
set -euo pipefail
INSTALL_DIR="$1"
DOMAIN="$2"
CERTBOT_EMAIL="$3"
export DOMAIN CERTBOT_EMAIL

if [[ ! -d "$INSTALL_DIR/.git" ]]; then
  echo "Нет git в $INSTALL_DIR. На сервере один раз: sudo bash scripts/vps-one-shot.sh (или git clone в этот путь)." >&2
  exit 1
fi

cd "$INSTALL_DIR"
git pull

if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
  DOMAIN="$DOMAIN" CERTBOT_EMAIL="$CERTBOT_EMAIL" bash scripts/vps-nginx-ssl.sh
else
  sudo env DOMAIN="$DOMAIN" CERTBOT_EMAIL="$CERTBOT_EMAIL" bash "$INSTALL_DIR/scripts/vps-nginx-ssl.sh"
fi

echo "=== pm2 ==="
command -v pm2 >/dev/null 2>&1 && pm2 list || echo "(pm2 не в PATH под этим пользователем — проверь от root или владельца app)"
echo "=== curl 127.0.0.1:3000 ==="
curl -sI --connect-timeout 3 http://127.0.0.1:3000 | head -8 || echo "Приложение не отвечает на :3000 — запусти: cd $INSTALL_DIR && pm2 start npm --name resale-shopping -- start"
REMOTE
