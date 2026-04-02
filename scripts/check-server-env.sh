#!/usr/bin/env bash
# Запуск на VPS из корня проекта: bash scripts/check-server-env.sh
# С Mac: ssh user@IP 'cd /root/resale-shopping && bash scripts/check-server-env.sh'
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"

ok() { echo "OK   $1"; }
bad() { echo "MISS $1"; }

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Файл не найден: $ENV_FILE" >&2
  exit 1
fi

# Значение первой строки KEY=... (без source — безопаснее для кавычек/спецсимволов)
raw_value() {
  local key="$1"
  local line
  line=$(grep "^${key}=" "$ENV_FILE" | tail -n1) || return 1
  local v="${line#*=}"
  v="${v%$'\r'}"
  v="${v#\"}"
  v="${v%\"}"
  v="${v#\'}"
  v="${v%\'}"
  v="${v#"${v%%[![:space:]]*}"}"
  v="${v%"${v##*[![:space:]]}"}"
  [[ -n "$v" ]] || return 1
  return 0
}

missing=0
for key in DATABASE_URL AUTH_SECRET AUTH_URL AUTH_YANDEX_ID AUTH_YANDEX_SECRET; do
  if raw_value "$key"; then
    ok "$key"
  else
    bad "$key"
    missing=1
  fi
done

auth_url_line=$(grep "^AUTH_URL=" "$ENV_FILE" | tail -n1 || true)
auth_url_val="${auth_url_line#AUTH_URL=}"
auth_url_val="${auth_url_val%$'\r'}"
auth_url_val="${auth_url_val#\"}"
auth_url_val="${auth_url_val%\"}"
if [[ "$auth_url_val" == "https://resale-shopping.ru" ]]; then
  ok "AUTH_URL ровно https://resale-shopping.ru"
else
  echo "WARN AUTH_URL сейчас: \"${auth_url_val:-}(пусто)\" — для OAuth на проде нужен https://resale-shopping.ru"
fi

exit "$missing"
