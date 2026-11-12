#!/usr/bin/env bash
# P23-E50: backup-db.sh <container> <db> <dir>
set -euo pipefail
if [ $# -ne 3 ]; then
  echo "שימוש: backup-db.sh <container> <db> <dir>" >&2
  exit 2
fi
mkdir -p "$3"
file="$3/$2-$(date +%F).sql.gz"
tmp="$file.tmp"
trap 'rm -f "$tmp"' EXIT
docker exec "$1" pg_dump -U postgres "$2" | gzip > "$tmp"
mv "$tmp" "$file"
echo "$file"
