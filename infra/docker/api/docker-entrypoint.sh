#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set in Render Environment variables."
  exit 1
fi

echo "Running database migrations..."
node /app/node_modules/prisma/build/index.js migrate deploy || {
  echo "ERROR: prisma migrate deploy failed."
  echo "Tip: use Neon DIRECT connection string (not -pooler) for DATABASE_URL."
  exit 1
}

echo "Starting BiteMate API..."
exec node dist/main.js
