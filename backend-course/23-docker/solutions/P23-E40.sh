#!/usr/bin/env bash
# P23-E40: Redis לפיתוח — run בפעם הראשונה, start אחר כך
set -euo pipefail
if docker ps -a --format '{{.Names}}' | grep -qx dev-redis; then
  docker start dev-redis
else
  docker run -d --name dev-redis -p 127.0.0.1:56379:6379 \
    -v dev-redis-data:/data --restart unless-stopped redis:8-alpine
fi
