#!/usr/bin/env bash
# P23-E46: count-errors.sh <container> — כמה שורות עם ERROR ב־docker logs (stdout וגם stderr)
# אין ← 0 · docker נכשל ← exit 1 · בלי ארגומנט ← exit 2
# בדיקה: npm run check P23-E46
set -euo pipefail

# כתוב כאן
