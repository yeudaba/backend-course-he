// P24-E66: מה עושים עם הבקשה?
// כתוב וייצא:
//   decide(entry, fp, now, ttlMs) ← { action: "execute" } | { action: "replay", status, body } | { action: "reject", status: 409 | 422, code }
//   shouldStore(status) — 2xx ו־4xx כן, 5xx לא
//
// בדיקה:  npm run check P24-E66
