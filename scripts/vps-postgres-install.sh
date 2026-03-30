#!/usr/bin/env bash
# Run on Ubuntu/Debian VPS: sudo bash scripts/vps-postgres-install.sh
# Installs PostgreSQL, creates DB and app user, prints DATABASE_URL.
set -euo pipefail

if [[ "$(uname -s)" == "Darwin" ]]; then
  echo "Этот скрипт только для Linux VPS (Ubuntu/Debian). На Mac не запускай — зайди по ssh на сервер и выполни там." >&2
  exit 1
fi

DB_NAME="${DB_NAME:-resale_shopping}"
DB_USER="${DB_USER:-resale_app}"
PASSWORD_FILE="${RESALE_DB_PASSWORD_FILE:-/root/.resale-shopping-db-password}"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  if [[ -f "$PASSWORD_FILE" ]]; then
    DB_PASSWORD="$(tr -d '\n\r' < "$PASSWORD_FILE")"
  else
    DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
    umask 077
    mkdir -p "$(dirname "$PASSWORD_FILE")"
    printf '%s\n' "$DB_PASSWORD" > "$PASSWORD_FILE"
    chmod 600 "$PASSWORD_FILE"
    echo "New DB password saved to ${PASSWORD_FILE} (keep this file; do not commit)."
  fi
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq postgresql postgresql-contrib openssl

systemctl enable --now postgresql

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  echo "Database ${DB_NAME} already exists."
else
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL

ENC_PASS="$(
  DB_PASSWORD="$DB_PASSWORD" python3 -c 'import urllib.parse, os; print(urllib.parse.quote(os.environ["DB_PASSWORD"], safe=""))' 2>/dev/null \
    || DB_PASSWORD="$DB_PASSWORD" node -e 'console.log(encodeURIComponent(process.env.DB_PASSWORD))'
)"

FULL_URL="postgresql://${DB_USER}:${ENC_PASS}@127.0.0.1:5432/${DB_NAME}"

if [[ -n "${RESALE_DB_URL_FILE:-}" ]]; then
  umask 077
  printf 'DATABASE_URL="%s"\n' "$FULL_URL" > "$RESALE_DB_URL_FILE"
  echo "Wrote DATABASE_URL to ${RESALE_DB_URL_FILE}"
fi

echo ""
echo "=== Add to .env on this server ==="
echo "DATABASE_URL=\"${FULL_URL}\""
echo "==================================="
echo "(If password has special chars, URL-encode it in DATABASE_URL)"
