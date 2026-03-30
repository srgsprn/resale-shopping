#!/usr/bin/env bash
# Один запуск на Ubuntu/Debian VPS (с правами root).
# Устанавливает Node 20, PostgreSQL, клонирует/обновляет репо, пишет DATABASE_URL в .env,
# гонит миграции, импорт каталога, next build. Опционально PM2.
#
# Использование (на VPS):
#   curl -fsSL https://raw.githubusercontent.com/srgsprn/resale-shopping/main/scripts/vps-one-shot.sh | sudo bash
# или из клонированного репозитория:
#   sudo bash scripts/vps-one-shot.sh
#
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/srgsprn/resale-shopping.git}"
INSTALL_DIR="${INSTALL_DIR:-/var/www/resale-shopping}"
WITH_PM2="${WITH_PM2:-1}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  exec sudo bash "$0" "$@"
fi

export DEBIAN_FRONTEND=noninteractive

if ! command -v apt-get >/dev/null 2>&1; then
  echo "Нужна Ubuntu/Debian (apt-get). На другой ОС напиши — дам отдельный скрипт." >&2
  exit 1
fi

echo "==> Пакеты: curl, git, PostgreSQL обработает отдельный скрипт"
apt-get update -qq
apt-get install -y -qq ca-certificates curl git openssl

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  echo "==> Node.js 20 (NodeSource)"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "node $(node -v) | npm $(npm -v)"

DEPLOY_USER="${SUDO_USER:-}"
if [[ -z "$DEPLOY_USER" || "$DEPLOY_USER" == "root" ]]; then
  DEPLOY_USER="$(logname 2>/dev/null || true)"
fi
if [[ -z "$DEPLOY_USER" || "$DEPLOY_USER" == "root" ]]; then
  DEPLOY_USER="root"
fi

mkdir -p "$(dirname "$INSTALL_DIR")"

if [[ ! -d "$INSTALL_DIR/.git" ]]; then
  echo "==> git clone -> $INSTALL_DIR"
  rm -rf "$INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR"
else
  echo "==> git pull"
  cd "$INSTALL_DIR"
  git pull
fi

cd "$INSTALL_DIR"
if [[ "$DEPLOY_USER" != "root" ]]; then
  chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$INSTALL_DIR"
fi

DB_URL_FILE="$(mktemp)"
chmod 600 "$DB_URL_FILE"
trap 'rm -f "$DB_URL_FILE"' EXIT

echo "==> PostgreSQL и пользователь БД"
RESALE_DB_URL_FILE="$DB_URL_FILE" bash scripts/vps-postgres-install.sh

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

DB_LINE="$(grep '^DATABASE_URL=' "$DB_URL_FILE" | head -1)"
if [[ -z "$DB_LINE" ]]; then
  echo "Не удалось прочитать DATABASE_URL из временного файла." >&2
  exit 1
fi

grep -v '^DATABASE_URL=' .env > .env.tmp
echo "$DB_LINE" >> .env.tmp
mv .env.tmp .env

# Публичный URL по умолчанию — IP сервера, если localhost
PUB_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
if grep -q '^NEXT_PUBLIC_SITE_URL="http://localhost:3000"' .env 2>/dev/null && [[ -n "$PUB_IP" ]]; then
  grep -v '^NEXT_PUBLIC_SITE_URL=' .env > .env.tmp
  echo "NEXT_PUBLIC_SITE_URL=\"http://${PUB_IP}:3000\"" >> .env.tmp
  mv .env.tmp .env
fi

echo "==> deps + migrate + import + build (от пользователя $DEPLOY_USER)"
if [[ "$DEPLOY_USER" != "root" ]]; then
  sudo -u "$DEPLOY_USER" bash scripts/vps-deploy.sh
else
  bash scripts/vps-deploy.sh
fi

if [[ "$WITH_PM2" == "1" ]]; then
  echo "==> PM2"
  npm install -g pm2 || true
  if [[ "$DEPLOY_USER" != "root" ]]; then
    sudo -u "$DEPLOY_USER" bash -lc "cd '$INSTALL_DIR' && pm2 delete resale-shopping 2>/dev/null || true; pm2 start npm --name resale-shopping -- start && pm2 save"
    echo "Чтобы сайт поднимался после перезагрузки, один раз под пользователем $DEPLOY_USER выполни: pm2 startup"
  else
    cd "$INSTALL_DIR"
    pm2 delete resale-shopping 2>/dev/null || true
    pm2 start npm --name resale-shopping -- start
    pm2 save
    pm2 startup | tail -n 1 | bash || true
  fi
fi

echo ""
echo "Готово. Сайт: см. NEXT_PUBLIC_SITE_URL в .env (порт 3000)."
echo "Добавь в .env ключи Stripe и Resend/SMTP — без них оплата/письма не заработают."
