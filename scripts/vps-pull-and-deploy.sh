#!/usr/bin/env bash
# Один раз на сервере: git pull + vps-deploy.sh.
# Можно запускать из ~ — ищет репозиторий или берёт REPO_DIR.
#
# Примеры:
#   REPO_DIR=/root/resale-shopping bash scripts/vps-pull-and-deploy.sh
#   bash ~/resale-shopping/scripts/vps-pull-and-deploy.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

resolve_root() {
  if [[ -n "${REPO_DIR:-}" ]]; then
    echo "$(cd "$REPO_DIR" && pwd)"
    return
  fi
  for d in "$DEFAULT_ROOT" /root/resale-shopping /var/www/resale-shopping "$HOME/resale-shopping"; do
    if [[ -f "$d/package.json" ]] && grep -q '"name"[[:space:]]*:[[:space:]]*"resale-shopping"' "$d/package.json" 2>/dev/null; then
      echo "$(cd "$d" && pwd)"
      return
    fi
  done
  echo ""
}

ROOT="$(resolve_root)"
if [[ -z "$ROOT" ]]; then
  echo "Не найден каталог resale-shopping. Задайте явно:" >&2
  echo "  REPO_DIR=/путь/к/resale-shopping bash $(readlink -f "$0" 2>/dev/null || echo "$0")" >&2
  exit 1
fi

cd "$ROOT"
echo "==> Репозиторий: $ROOT"

git pull origin main

bash "$ROOT/scripts/vps-deploy.sh"
