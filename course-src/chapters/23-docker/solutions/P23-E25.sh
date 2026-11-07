#!/usr/bin/env bash
# P23-E25: מחכה עד שכתובת עונה 2xx, או עד שנגמר הזמן
set -uo pipefail

if [ $# -ne 2 ]; then
  echo "שימוש: wait-for.sh <url> <שניות>" >&2
  exit 2
fi

url="$1"
timeout="$2"
echo "מחכה ל־$url..."
start=$SECONDS
while [ $((SECONDS - start)) -lt "$timeout" ]; do
  # -f: קוד 4xx/5xx ← כישלון.  -s: בלי פס התקדמות.  --max-time: לא להיתקע על חיבור תקוע
  if curl -fs -o /dev/null --max-time 2 "$url"; then
    echo "✔ $url עונה"
    exit 0
  fi
  sleep 1
done

echo "✖ $url לא ענה תוך $timeout שניות" >&2
exit 1
