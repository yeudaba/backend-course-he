#!/usr/bin/env bash
# הכנת סביבת אימות בענן/לינוקס (Claude Code on the web וכדומה).
# במק אין צורך — build.mjs משתמש ב־/Library/PostgreSQL/18 ו־course-src/.pgdata.
# מה זה עושה: מפעיל Docker, מריץ PostgreSQL 18 בקונטיינר course-pg על פורט 5433
# (trust, אזור זמן Asia/Jerusalem), מעתיק ממנו psql 18 ל־/opt/pg18, מתקין Node 24 ל־/opt/node24, ומתקין את התלויות.
# אחר כך מריצים את הבנייה עם Node 24 (כמו אצל הלומד; פרק 22 דורש אותו):
#   PATH=/opt/node24/bin:$PATH node course-src/build.mjs --verify
set -euo pipefail
cd "$(dirname "$0")/.."
if ! docker info >/dev/null 2>&1; then (nohup dockerd >/tmp/dockerd.log 2>&1 &); for i in $(seq 30); do docker info >/dev/null 2>&1 && break; sleep 1; done; fi
docker start course-pg >/dev/null 2>&1 || docker run -d --name course-pg -p 5433:5432 \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e TZ=Asia/Jerusalem postgres:18 -c timezone=Asia/Jerusalem >/dev/null
if [ ! -x /opt/pg18/bin/psql ]; then
  mkdir -p /opt/pg18img/lib /opt/pg18/bin
  docker cp course-pg:/usr/lib/postgresql/18 /opt/pg18img/
  for f in $(docker exec course-pg sh -c 'ls /usr/lib/x86_64-linux-gnu/libpq.so*'); do docker cp -L "course-pg:$f" /opt/pg18img/lib/; done
  for b in psql pg_isready pg_dump; do
    printf '#!/bin/sh\nLD_LIBRARY_PATH=/opt/pg18img/lib exec /opt/pg18img/18/bin/%s "$@"\n' "$b" > /opt/pg18/bin/$b; chmod +x /opt/pg18/bin/$b
  done
fi
if [ ! -x /opt/node24/bin/node ]; then
  file=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt | grep -o 'node-v24[^ ]*-linux-x64.tar.xz' | head -1)
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/$file" | tar xJ -C /opt && mv "/opt/${file%.tar.xz}" /opt/node24
fi
/opt/node24/bin/node -v
[ -d node_modules ] || npm ci --no-audit --no-fund
for i in $(seq 30); do /opt/pg18/bin/pg_isready -q -h localhost -p 5433 && break; sleep 1; done
/opt/pg18/bin/pg_isready -h localhost -p 5433
