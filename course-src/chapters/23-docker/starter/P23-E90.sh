#!/usr/bin/env bash
# P23-E90: docker-up.sh — אין .env ← cp .env.example .env + הודעה, exit 1 · JWT_SECRET קצר מ־32 ← הודעה, exit 1
# docker compose up -d --build --wait ← "הכול עלה" · נכשל ← docker compose logs --no-color --tail 50, exit 1
# בדיקה: npm run check P23-E90
set -euo pipefail

# כתוב כאן
