#!/usr/bin/env bash
# P23-E100: smoke.sh <baseUrl> — health 200, register 201, login 200, POST /tasks 201, GET /tasks 200 עם "smoke"
# ✔ <צעד> לכל הצלחה · ✘ <צעד>: <status> ל־stderr, exit 1 · בלי ארגומנט ← exit 2 · בלי jq (node -e)
# בדיקה: npm run check P23-E100
set -euo pipefail

# כתוב כאן
