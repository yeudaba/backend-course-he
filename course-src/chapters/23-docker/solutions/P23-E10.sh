#!/usr/bin/env bash
# P23-E10: קובצי .log גדולים מ־N KB בתיקייה (ובתתי־תיקיות), ממוינים
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "שימוש: big-logs.sh <תיקייה> <KB>" >&2
  exit 2
fi

find "$1" -type f -name "*.log" -size +"$2"k | sort
