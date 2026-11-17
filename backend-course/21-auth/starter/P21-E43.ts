// P21-E43: verifyAndUpgrade — מ־SHA-256 ל־bcrypt
// כתוב וייצא type StoredUser = { id, passwordHash } ו־verifyAndUpgrade(user, password, save, rounds): Promise<boolean>
//   $2... ← bcrypt.compare | 64 hex ← sha256 בזמן קבוע (timingSafeEqual); נכון ← save(id, bcrypt hash) ו־true
//   כל צורה אחרת ← false
//
// הרצה:   node 21-auth/starter/P21-E43.ts
// בדיקה:  npm run check P21-E43
