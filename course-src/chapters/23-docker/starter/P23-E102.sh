#!/usr/bin/env bash
# P23-E102: PostgreSQL לפיתוח — נתקע, נעצר, לא נגיש, ומאבד נתונים. ארבע תקלות.
# ברקע · שם dev-db · postgres:18-alpine · סיסמה dev · 127.0.0.1:55432 · volume dev-db-data ב־/var/lib/postgresql
#
# בדיקה:  npm run check P23-E102
set -euo pipefail
docker run --name dev-db \
  -p 5432 \
  -v /var/lib/postgresql \
  postgres:18-alpine
