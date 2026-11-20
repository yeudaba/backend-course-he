#!/usr/bin/env bash
# P23-E102: PostgreSQL לפיתוח — מתוקן
set -euo pipefail
docker run -d --name dev-db \
  -e POSTGRES_PASSWORD=dev \

  -v dev-db-data:/var/lib/postgresql \
  postgres:18-alpine
