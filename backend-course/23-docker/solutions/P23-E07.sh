#!/usr/bin/env bash
# P23-E07: N כתובות ה־IP עם הכי הרבה בקשות (ברירת מחדל 3): "כמות כתובת"
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "שימוש: top-ips.sh <access.log> [N]" >&2
  exit 2
fi

awk '{ print $1 }' "$1" \
  | sort \
  | uniq -c \
  | sort -k1,1nr -k2,2 \
  | head -n "${2:-3}" \
  | awk '{ print $1, $2 }'
