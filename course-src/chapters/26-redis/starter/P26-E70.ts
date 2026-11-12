// P26-E70: מנעול שמחכה בתור
// כתוב וייצא async withLockRetry(redis, name, ttlMs, fn, { retries = 10, delayMs = 50 } = {})
//   lock:<name> עם token (SET NX PX) · תפוס ← מחכה ומנסה שוב · נגמרו הניסיונות ← Error("LOCKED")
//   מריץ fn ומחזיר את התוצאה · משחרר תמיד, רק אם ה־token עדיין שלו (Lua)
//
// בדיקה:  npm run check P26-E70
