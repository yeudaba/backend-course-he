#!/usr/bin/env bash
# P23-E100: smoke.sh <baseUrl> — הרשמה, כניסה, משימה
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "שימוש: smoke.sh <baseUrl>" >&2
  exit 2
fi
base="$1"
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
req() { curl -s -o "$tmp" -w '%{http_code}' "$@"; }
check() { # check <name> <expected> <actual>
  if [ "$3" != "$2" ]; then
    echo "✘ $1: $3" >&2
    exit 1
  fi
  echo "✔ $1"
}
email="smoke-$RANDOM$RANDOM@example.com"
body="{\"email\":\"$email\",\"password\":\"smoke-password-1\"}"
json=(-H "Content-Type: application/json")

check health 200 "$(req "$base/health")"
check register 201 "$(req -X POST "${json[@]}" -d "$body" "$base/auth/register")"
check login 200 "$(req -X POST "${json[@]}" -d "$body" "$base/auth/login")"
token=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).accessToken)' "$tmp")
auth=(-H "Authorization: Bearer $token")
check create 201 "$(req -X POST "${json[@]}" "${auth[@]}" -d '{"title":"smoke"}' "$base/tasks")"
status=$(req "${auth[@]}" "$base/tasks")
if ! grep -q '"smoke"' "$tmp"; then
  echo "✘ list: $status, בלי המשימה" >&2
  exit 1
fi
check list 200 "$status"
