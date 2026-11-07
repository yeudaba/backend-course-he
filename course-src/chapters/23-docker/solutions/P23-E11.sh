#!/usr/bin/env bash
# P23-E11: מסד PostgreSQL לפיתוח, בפקודה אחת. אפשר להריץ שוב ושוב
set -euo pipefail

# אם כבר יש קונטיינר בשם הזה — מוחקים אותו (את ה־volume לא! שם הנתונים)
docker rm -f p23-e11-db >/dev/null 2>&1 || true

docker run -d \
  --name p23-e11-db \
  --restart unless-stopped \
  -e POSTGRES_PASSWORD=course \
  -e POSTGRES_DB=shop \
  -p 55432:5432 \
  -v p23-e11-data:/var/lib/postgresql \
  postgres:18-alpine
