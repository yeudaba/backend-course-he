#!/usr/bin/env bash
# P23-E37: check-health.sh <url>
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "שימוש: check-health.sh <url>" >&2
  exit 2
fi
if ! body=$(curl -fsS --max-time 3 "$1" 2>&1); then
  echo "FAIL: $body" >&2
  exit 1
fi
if ! grep -q '"ok":true' <<< "$body"; then
  echo 'FAIL: body without "ok":true' >&2
  exit 1
fi
echo OK
