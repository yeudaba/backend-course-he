// P21-E100: changePassword בטרנזקציה
// כתוב וייצא changePassword(pool, userId, oldPassword, newPassword, rounds, now) ← "OK" | "NOT_FOUND" | "WRONG_PASSWORD"
//   pool.connect() + BEGIN | SELECT ... FOR UPDATE | bcrypt.compare | UPDATE users | ביטול refresh tokens | COMMIT
//   יציאה מוקדמת / שגיאה ← ROLLBACK (ושגיאה נזרקת) | release תמיד
//
// הרצה:   node 21-auth/starter/P21-E100.ts
// בדיקה:  npm run check P21-E100
