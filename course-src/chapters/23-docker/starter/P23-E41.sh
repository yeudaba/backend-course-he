#!/usr/bin/env bash
# P23-E41: psql-in.sh <container> <sql> ← docker exec <container> psql -U postgres -d ${DB:-postgres} -tAc <sql>
# ה־SQL — ארגומנט אחד, כמו שהוא · לא 2 ארגומנטים ← exit 2
# הרצה: bash 23-docker/starter/P23-E41.sh demo-db "select 1"   ·   בדיקה: npm run check P23-E41
set -euo pipefail

# כתוב כאן
