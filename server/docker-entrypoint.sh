#!/bin/sh
set -e
if [ "$SKIP_MIGRATIONS" != "1" ]; then
  npx prisma migrate deploy
fi
exec "$@"
