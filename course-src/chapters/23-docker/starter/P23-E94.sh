#!/usr/bin/env bash
# P23-E94: wait-healthy.sh <container> <timeoutSeconds> — docker inspect -f '{{.State.Health.Status}}'
# healthy ← "healthy", exit 0 · unhealthy ← exit 1 מיד · אחרת מחכים ${POLL_INTERVAL:-1} · timeout ← exit 1 · ארגומנטים שגויים ← exit 2
# בדיקה: npm run check P23-E94
set -euo pipefail

# כתוב כאן
