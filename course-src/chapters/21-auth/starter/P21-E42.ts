// P21-E42: UsersRegistry — הרשמה בלי כפילויות, גם במקביל
// כתוב וייצא class UsersRegistry: constructor(rounds), register(email, password) ← { id, email }
//   findByEmail(email), getter size. אימייל מנורמל, ids מ־1, bcrypt hash, קיים ← Error("EMAIL_TAKEN")
//   5 הרשמות באותו רגע עם אותו אימייל ← בדיוק אחת מצליחה
//
// הרצה:   node 21-auth/starter/P21-E42.ts
// בדיקה:  npm run check P21-E42
