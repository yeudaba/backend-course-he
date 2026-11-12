#!/usr/bin/env bash
# P23-E42: cleanup.sh <prefix> — docker ps -a --filter status=exited --format '{{.Names}}'
# לכל שם שמתחיל ב־prefix: docker rm, ומדפיסים את השם · בסוף: removed N · בלי prefix / ריק ← exit 2
# הרצה: bash 23-docker/starter/P23-E42.sh demo-   ·   בדיקה: npm run check P23-E42
set -euo pipefail

# כתוב כאן
