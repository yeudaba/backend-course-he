#!/usr/bin/env bash
# P23-E37: check-health.sh <url> — curl -fsS --max-time 3; גוף עם "ok":true ← OK (exit 0)
# אחרת ← "FAIL: <סיבה>" ל־stderr, exit 1 · בלי ארגומנט ← exit 2
# הרצה: bash 23-docker/starter/P23-E37.sh http://localhost:3000/health   ·   בדיקה: npm run check P23-E37
set -euo pipefail

# כתוב כאן
