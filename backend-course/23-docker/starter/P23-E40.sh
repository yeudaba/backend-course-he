#!/usr/bin/env bash
# P23-E40: Redis לפיתוח — יש קונטיינר בשם בדיוק dev-redis (docker ps -a --format '{{.Names}}') ← docker start dev-redis
# אין ← docker run -d --name dev-redis -p 127.0.0.1:56379:6379 -v dev-redis-data:/data --restart unless-stopped redis:8-alpine
# הרצה: bash 23-docker/starter/P23-E40.sh   ·   בדיקה: npm run check P23-E40
set -euo pipefail

# כתוב כאן
