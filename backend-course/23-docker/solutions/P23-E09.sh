#!/usr/bin/env bash
# P23-E09: בודק שההגדרות קיימות לפני שהשרת עולה (למשל ב־entrypoint של קונטיינר)
set -uo pipefail

ok=1
for name in DATABASE_URL JWT_SECRET; do
  if [ -z "${!name:-}" ]; then
    echo "חסר: $name" >&2
    ok=0
  fi
done

if [ -n "${JWT_SECRET:-}" ] && [ "${#JWT_SECRET}" -lt 32 ]; then
  echo "JWT_SECRET קצר מדי (${#JWT_SECRET} תווים, צריך 32)" >&2
  ok=0
fi

if [ "$ok" -eq 1 ]; then
  echo "OK"
else
  exit 1
fi
