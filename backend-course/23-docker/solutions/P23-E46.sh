#!/usr/bin/env bash
# P23-E46: count-errors.sh <container>
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "שימוש: count-errors.sh <container>" >&2
  exit 2
fi
if ! logs=$(docker logs "$1" 2>&1); then
  echo "$logs" >&2
  exit 1
fi
grep -c ERROR <<< "$logs" || true
