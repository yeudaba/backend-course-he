#!/usr/bin/env bash
# P23-E08: סכום הזמנות לכל לקוח, מהגדול לקטן: "לקוח סכום" (2 ספרות אחרי הנקודה)
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "שימוש: sum-by-customer.sh <orders.csv>" >&2
  exit 2
fi

tail -n +2 "$1" \
  | awk -F, '{ total[$2] += $3 } END { for (c in total) printf "%s %.2f\n", c, total[c] }' \
  | sort -k2,2nr -k1,1
