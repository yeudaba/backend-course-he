#!/usr/bin/env bash
# P23-E102: PostgreSQL לפיתוח — מתוקן
set -euo pipefail
docker run -d --name dev-db \
  -e POSTGRES_PASSWORD=dev \
  -p 127.0.0.1:55432:5432 \
  -v dev-db-data:/var/lib/postgresql \
  postgres:18-alpine
