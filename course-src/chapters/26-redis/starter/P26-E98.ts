// P26-E98: מייל פעם אחת — UNIQUE ו־23505
// כתוב וייצא async recordEmailOnce(pool, { kind, orderId, to, subject, body }) → "sent" | "duplicate"
//   INSERT ל־email_outbox · 23505 ← duplicate · שגיאה אחרת עולה
//
// בדיקה:  npm run check P26-E98
