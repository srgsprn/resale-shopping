#!/usr/bin/env bash
# Запуск обновления характеристик с Alfa в фоне на сервере (можно закрыть SSH / ноут).
# Лог: по умолчанию /tmp/resale-attrs-refresh.log
#
#   bash scripts/attrs-refresh-background.sh
#   tail -f /tmp/resale-attrs-refresh.log
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG="${ATTRS_REFRESH_LOG:-/tmp/resale-attrs-refresh.log}"

cd "$ROOT"
if ! grep -q '"name"[[:space:]]*:[[:space:]]*"resale-shopping"' package.json 2>/dev/null; then
  echo "Запускай из корня resale-shopping" >&2
  exit 1
fi

if [[ -f /tmp/resale-attrs-refresh.pid ]] && kill -0 "$(cat /tmp/resale-attrs-refresh.pid)" 2>/dev/null; then
  echo "Уже идёт процесс PID $(cat /tmp/resale-attrs-refresh.pid). Лог: tail -f $LOG" >&2
  exit 1
fi

export NODE_ENV="${NODE_ENV:-production}"
# shellcheck disable=SC2086
nohup env NODE_ENV="$NODE_ENV" npm run attrs:refresh-alfa >>"$LOG" 2>&1 &
echo $! >/tmp/resale-attrs-refresh.pid
echo "Запущено в фоне PID=$(cat /tmp/resale-attrs-refresh.pid)"
echo "Лог: tail -f $LOG"
echo "Статус: ps -p \$(cat /tmp/resale-attrs-refresh.pid)"
