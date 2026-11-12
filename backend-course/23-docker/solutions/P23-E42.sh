#!/usr/bin/env bash
# P23-E42: cleanup.sh <prefix> — מוחק קונטיינרים שעצרו ששמם מתחיל ב־prefix
set -euo pipefail
if [ $# -ne 1 ] || [ -z "$1" ]; then
  echo "שימוש: cleanup.sh <prefix>" >&2
  exit 2
fi
count=0
while IFS= read -r name; do
  if [[ "$name" == "$1"* ]]; then
    docker rm "$name" > /dev/null
    echo "$name"
    count=$((count + 1))
  fi
done < <(docker ps -a --filter status=exited --format '{{.Names}}')
echo "removed $count"
