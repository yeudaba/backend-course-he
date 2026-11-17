// P26-E119: הודעות WebSocket עם zod
// כתוב וייצא parseClientMessage(raw) → { ok: true, msg } | { ok: false, error }
//   join { room: [a-z0-9-]{1,30} } · say { text: 1–500 אחרי trim } · typing {} · שדות נוספים ← לא תקין
//   JSON שבור ← { ok: false, error: "JSON לא תקין" }
//
// בדיקה:  npm run check P26-E119
