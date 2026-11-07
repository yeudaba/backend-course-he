#!/usr/bin/env bash
# P23-E22 (מתוקן): מעתיק את כל קובצי ה־JSON מתיקייה אחת לאחרת
set -euo pipefail # ← היה חסר: שגיאה באמצע לא עצרה את הסקריפט, והוא דיווח הצלחה

if [ $# -ne 2 ]; then # ← היה חסר: בלי ארגומנטים — "הצלחה" על כלום
  echo "שימוש: backup.sh <מקור> <יעד>" >&2
  exit 2
fi

src="$1"
dest="$2"
mkdir -p "$dest"

count=0
for f in "$src"/*.json; do # ← היה $src/*.json בלי מרכאות: נשבר על תיקייה עם רווח
  [ -e "$f" ] || continue # אין קבצים בכלל — הדפוס נשאר כמו שהוא
  cp "$f" "$dest/" # ← היה cp $f $dest/
  count=$((count + 1))
done

echo "הועתקו $count קבצים"
