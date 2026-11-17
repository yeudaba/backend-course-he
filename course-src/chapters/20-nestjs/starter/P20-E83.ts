// P20-E83: /health עם בדיקת מסד ו־timeout
// כתוב וייצא DB_PING (token), HealthController, HealthModule
//   GET /health ← 200 { status: "ok", checks: { db: "up" } } או 503 { status: "error", checks: { db: "down" } }; timeout 200ms
//
// בדיקה:  npm run check P20-E83
