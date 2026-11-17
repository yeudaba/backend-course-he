// P27-E93: Idempotency-Key בזיכרון
// כתוב וייצא createIdempotency(ttlMs, now = Date.now) → { run(key, body, fn) → { status: "fresh" | "replayed", result } }
//
// בדיקה:  npm run check P27-E93
