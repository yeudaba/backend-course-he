#!/usr/bin/env bash
# P23-E35: status codes לפי קבוצות — P23-E35.sh <access.log> ← "2xx 7", "4xx 3"... (לפי הסדר, רק מה שיש)
# בלי ארגומנט ← exit 2 · אין קובץ ← exit 1
# הרצה: bash 23-docker/starter/P23-E35.sh 23-docker/files/logs/access.log   ·   בדיקה: npm run check P23-E35
set -euo pipefail

# כתוב כאן
