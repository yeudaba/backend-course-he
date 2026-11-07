#!/usr/bin/env bash
# P23-E22: מעתיק את כל קובצי ה־JSON מתיקייה אחת לאחרת.
# "עובד אצלי" — אבל נשבר על תיקיות עם רווח, "מצליח" בלי ארגומנטים, ומדווח הצלחה גם כשההעתקה נכשלה.

src=$1
dest=$2
mkdir -p $dest

count=0
for f in $src/*.json; do
  cp $f $dest/
  count=$((count + 1))
done

echo "הועתקו $count קבצים"
