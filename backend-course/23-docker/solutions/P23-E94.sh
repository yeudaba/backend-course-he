#!/usr/bin/env bash
# P23-E94: wait-healthy.sh <container> <timeoutSeconds>
set -euo pipefail
if [ $# -ne 2 ] || ! [[ "$2" =~ ^[1-9][0-9]*$ ]]; then
  echo "שימוש: wait-healthy.sh <container> <timeoutSeconds>" >&2
  exit 2
fi
deadline=$((SECONDS + $2))
while [ "$SECONDS" -lt "$deadline" ]; do
  status=$(docker inspect -f '{{.State.Health.Status}}' "$1" 2>/dev/null || true)
  case "$status" in
    healthy) echo healthy; exit 0 ;;
    unhealthy) echo "$1: unhealthy" >&2; exit 1 ;;
  esac
  sleep "${POLL_INTERVAL:-1}"
done
echo "timeout: $1 לא healthy" >&2
exit 1
