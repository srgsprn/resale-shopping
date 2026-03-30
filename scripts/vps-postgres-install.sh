#!/usr/bin/env bash
# Run on Ubuntu/Debian VPS: sudo bash scripts/vps-postgres-install.sh
# Installs PostgreSQL, creates DB and app user, prints DATABASE_URL.
set -euo pipefail

DB_NAME="${DB_NAME:-resale_shopping}"
DB_USER="${DB_USER:-resale_app}"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
  echo "Generated DB_PASSWORD (save it): ${DB_PASSWORD}"
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

echo ""
echo "=== Add to .env on this server ==="
echo "DATABASE_URL=\"postgresql://${DB_USER}:${ENC_PASS}@127.0.0.1:5432/${DB_NAME}\""
echo "==================================="
echo "(If password has special chars, URL-encode it in DATABASE_URL)"
