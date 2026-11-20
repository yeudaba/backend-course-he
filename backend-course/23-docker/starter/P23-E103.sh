#!/usr/bin/env bash
# P23-E103: להעלות את פרויקט 2 — דורס .env, כותב ✔ מוקדם מדי, ומחזיר 0 גם כשנכשל. שלוש תקלות.
# אין .env ← העתקה מ־.env.example + "נוצר .env מ־.env.example"
# docker compose up -d --build --wait ← הצליח: "✔ http://localhost:3000" · נכשל: logs --tail 50 api, ואז exit 1
#
# בדיקה:  npm run check P23-E103
set -uo pipefail
cp .env.example .env
echo "נוצר .env מ־.env.example"
docker compose up -d --build || echo "נכשל"
echo "✔ http://localhost:3000"
