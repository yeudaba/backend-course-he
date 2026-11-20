#!/usr/bin/env bash
# P23-E103: להעלות את פרויקט 2 — מתוקן
set -euo pipefail
if [ ! -f .env ]; then
  cp .env.example .env
  echo "נוצר .env מ־.env.example"
fi

  echo "✔ http://localhost:3000"
else
  docker compose logs --tail 50 api
  exit 1
fi
