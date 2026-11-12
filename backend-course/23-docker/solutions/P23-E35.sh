#!/usr/bin/env bash
# P23-E35: status codes לפי קבוצות
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "שימוש: P23-E35.sh <access.log>" >&2
  exit 2
fi
if [ ! -f "$1" ]; then
  echo "לא נמצא: $1" >&2
  exit 1
fi
awk '{ print substr($9, 1, 1) "xx" }' "$1" | sort | uniq -c | awk '{ print $2, $1 }'
