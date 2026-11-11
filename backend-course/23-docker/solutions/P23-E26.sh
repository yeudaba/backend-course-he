#!/usr/bin/env bash
# P23-E26 — rotate-backups.sh <dir> <keep>
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "שימוש: rotate-backups.sh <dir> <keep>" >&2
  exit 2
fi
dir=$1
keep=$2

if ! [[ $keep =~ ^[1-9][0-9]*$ ]]; then
  echo "keep חייב להיות מספר שלם חיובי: $keep" >&2
  exit 2
fi
if [ ! -d "$dir" ]; then
  echo "התיקייה לא קיימת: $dir" >&2
  exit 1
fi

# רק גיבויים בשם הנכון; התאריך בפורמט YYYY-MM-DD ממוין נכון גם כטקסט
backups=$(find "$dir" -maxdepth 1 -type f -name 'db-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].sql.gz' -exec basename {} \; | sort)
count=$(printf '%s\n' "$backups" | grep -c . || true)

if [ "$count" -le "$keep" ]; then
  exit 0
fi

printf '%s\n' "$backups" | head -n $((count - keep)) | while read -r name; do
  rm -- "$dir/$name"
  echo "$name"
done
