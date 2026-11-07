#!/usr/bin/env bash
# P23-E06: כמה שורות ברמת ERROR יש בלוג
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "שימוש: count-errors.sh <קובץ-לוג>" >&2
  exit 2
fi
if [ ! -f "$1" ]; then
  echo "לא נמצא הקובץ: $1" >&2
  exit 1
fi

# העמודה השנייה היא הרמה. grep -c ERROR היה סופר גם שורה שהמילה מופיעה בה בטקסט
awk '$2 == "ERROR"' "$1" | wc -l | tr -d ' '
