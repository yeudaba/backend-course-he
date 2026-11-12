// P21-E68: refresh_tokens ב־PostgreSQL (db = Client או Pool של pg)
// כתוב וייצא insertToken(db, userId, tokenHash, expiresAt) ← id | findByHash(db, tokenHash) ← { id, userId, expiresAt, revokedAt } | undefined
//   revoke(db, id, now) ← true רק אם הוא ביטל (WHERE ... AND revoked_at IS NULL) | revokeAllForUser(db, userId, now) ← כמה בוטלו
//
// הרצה:   node 21-auth/starter/P21-E68.ts
// בדיקה:  npm run check P21-E68
