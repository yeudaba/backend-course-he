#!/usr/bin/env bash
# P23-E90: docker-up.sh — בדיקות לפני docker compose up
set -euo pipefail
if [ ! -f .env ]; then
  cp .env.example .env
  echo "נוצר .env — הגדר בו JWT_SECRET" >&2
  exit 1
fi
secret=$(grep -E '^JWT_SECRET=' .env | head -n 1 | cut -d= -f2- || true)
if [ "${#secret}" -lt 32 ]; then
  echo "JWT_SECRET קצר מ־32 תווים" >&2
  exit 1
fi
if ! docker compose up -d --build --wait; then
  docker compose logs --no-color --tail 50
  exit 1
fi
echo "הכול עלה"
