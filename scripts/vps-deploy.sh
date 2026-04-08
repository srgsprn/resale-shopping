#!/usr/bin/env bash
# Продакшен-сборка на VPS. Можно вызывать из любой директории — скрипт сам cd в корень репо.
#
# Использование на сервере:
#   bash /root/resale-shopping/scripts/vps-deploy.sh
# или уже в корне репозитория:
#   bash scripts/vps-deploy.sh
#
# Опции окружения:
#   RUN_ALFA_IMPORT=1  — после миграций запустить npm run db:import:alfa-json (тяжело, не для каждого релиза)
#   PM2_APP=resale-shopping — имя процесса в PM2 (по умолчанию resale-shopping)
#   RESTART_PM2=0      — не вызывать pm2 restart, даже если PM2 установлен
#   SKIP_CLEAN_NEXT=1  — не удалять .next перед build (быстрее, но возможен старый кэш/404)
#   ADMIN_ENSURE=1     — после migrate выполнить npm run admin:ensure (логин admin / пароль из .env или дефолт)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"

if ! grep -q '"name"[[:space:]]*:[[:space:]]*"resale-shopping"' package.json 2>/dev/null; then
  echo "Ошибка: это не корень репозитория resale-shopping (ожидалось package.json с \"name\": \"resale-shopping\")." >&2
  echo "Текущий каталог после cd: $ROOT" >&2
  echo "Сделайте: cd /root/resale-shopping   # или /var/www/resale-shopping" >&2
  echo "Затем: bash scripts/vps-deploy.sh" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Нет файла .env в $ROOT. Скопируйте .env.example в .env и задайте DATABASE_URL, AUTH_SECRET, Stripe и т.д." >&2
  exit 1
fi

echo "==> Деплой resale-shopping в $ROOT"

# Tailwind/PostCSS в devDependencies — для next build на VPS нужны все пакеты
npm ci --include=dev

export NODE_ENV="${NODE_ENV:-production}"

npm run db:generate
npx prisma migrate deploy

if [[ "${ADMIN_ENSURE:-0}" == "1" ]]; then
  echo "==> Учётка админа (ADMIN_ENSURE=1 → npm run admin:ensure)"
  npm run admin:ensure
fi

echo "==> Нормализация названий товаров (убрать приписку Resale Shopping)"
npm run names:normalize

echo "==> Синхронизация брендов из существующих товаров"
npm run brands:sync

echo "==> Нормализация SKU (префикс RS)"
npm run sku:normalize

if [[ "${RUN_ALFA_IMPORT:-0}" == "1" ]]; then
  echo "==> Импорт каталога (RUN_ALFA_IMPORT=1)"
  npm run db:import:alfa-json
else
  echo "==> Импорт каталога пропущен (для полного импорта: RUN_ALFA_IMPORT=1 bash scripts/vps-deploy.sh)"
fi

if [[ "${SKIP_CLEAN_NEXT:-0}" != "1" ]]; then
  echo "==> Удаление .next (сброс кэша Next — убирает закэшированные 404 после смены маршрутов)"
  rm -rf .next
fi

npm run build

PM2_APP="${PM2_APP:-resale-shopping}"
if [[ "${RESTART_PM2:-1}" == "1" ]] && command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
    echo "==> pm2 restart $PM2_APP"
    pm2 restart "$PM2_APP" --update-env
  else
    echo "PM2 установлен, но процесса «$PM2_APP» нет — перезапуск пропущен."
    echo "    Старт (пример): cd $ROOT && PORT=3001 pm2 start npm --name $PM2_APP -- start"
  fi
else
  echo "==> PM2 restart пропущен (RESTART_PM2=0 или pm2 не в PATH). Запуск вручную: npm run start"
fi

echo "==> Готово."
