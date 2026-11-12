#!/usr/bin/env bash
# P23-E41: psql-in.sh <container> <sql>
set -euo pipefail
if [ $# -ne 2 ]; then
  echo "שימוש: psql-in.sh <container> <sql>" >&2
  exit 2
fi
docker exec "$1" psql -U postgres -d "${DB:-postgres}" -tAc "$2"
