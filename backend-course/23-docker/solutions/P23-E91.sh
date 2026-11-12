#!/usr/bin/env bash
# P23-E91: dc.sh — קיצורים ל־docker compose של הפרויקט
set -euo pipefail
usage() { echo "שימוש: dc.sh up|down|seed|logs [service]|psql|reset -y" >&2; exit 2; }
case "${1:-}" in
  up) docker compose up -d --build --wait ;;
  down) docker compose down ;;
  seed) docker compose run --rm migrate npm run db:seed ;;
  logs) docker compose logs -f ${2:+"$2"} ;;
  psql) docker compose exec db psql -U tasks tasks ;;
  reset)
    if [ "${2:-}" != "-y" ]; then
      echo "reset מוחק את המסד. הרץ: dc.sh reset -y" >&2
      exit 1
    fi
    docker compose down -v
    docker compose up -d --build --wait
    ;;
  *) usage ;;
esac
