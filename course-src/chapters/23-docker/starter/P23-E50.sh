#!/usr/bin/env bash
# P23-E50: backup-db.sh <container> <db> <dir> — docker exec <container> pg_dump -U postgres <db> | gzip
# ← <dir>/<db>-YYYY-MM-DD.sql.gz (date +%F), ומדפיסים את הנתיב · כישלון ← exit 1 בלי קובץ · לא 3 ארגומנטים ← exit 2
# הרצה: bash 23-docker/starter/P23-E50.sh dev-db shop backups   ·   בדיקה: npm run check P23-E50
set -euo pipefail

# כתוב כאן
