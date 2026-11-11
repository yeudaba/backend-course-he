#!/usr/bin/env bash
# P23-E26: rotate-backups.sh <dir> <keep> — משאיר את keep הגיבויים החדשים (db-YYYY-MM-DD.sql.gz) ומוחק את השאר
# מדפיס כל קובץ שנמחק (מהישן לחדש) · קבצים אחרים לא נוגעים · ארגומנטים שגויים ← exit 2 · אין תיקייה ← exit 1
# הרצה: bash 23-docker/starter/P23-E26.sh backups 3   ·   בדיקה: npm run check P23-E26
set -euo pipefail

# כתוב כאן
