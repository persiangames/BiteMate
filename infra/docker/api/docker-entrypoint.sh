#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set in Render Environment variables."
  exit 1
fi

MIGRATE_URL="${DIRECT_DATABASE_URL:-$DATABASE_URL}"

if echo "$DATABASE_URL" | grep -qi pooler; then
  if [ -z "$DIRECT_DATABASE_URL" ]; then
    echo "WARN: DATABASE_URL looks like a pooled connection (e.g. Neon pooler)."
    echo "WARN: prisma migrate deploy can hang. Set DIRECT_DATABASE_URL to the direct host (no -pooler)."
  fi
fi

echo "Running database migrations..."
echo "Migration DB: $(echo "$MIGRATE_URL" | sed -E 's|://[^@]+@|://***@|')"

DATABASE_URL="$MIGRATE_URL" node /app/node_modules/prisma/build/index.js migrate deploy || {
  echo "ERROR: prisma migrate deploy failed."
  echo "Tip: on Neon, set DIRECT_DATABASE_URL to the direct connection string (not -pooler)."
  exit 1
}

echo "Migrations complete."
echo "Starting BiteMate API on port ${PORT:-3000}..."
export NODE_ENV="${NODE_ENV:-production}"
exec node --trace-uncaught dist/main.js
