// P21-E93: AuthSession — access בזיכרון, refresh ב־storage
// כתוב וייצא type StorageLike ו־class AuthSession(baseUrl, storage): get accessToken, login(email, password), restore(), logout()
//   login: POST /auth/login ← access בשדה, refresh ב־storage["refreshToken"]; לא 200 ← Error(message)
//   restore: אין ← false | POST /auth/refresh: 200 ← true, אחרת מוחקים ← false | logout: POST /auth/logout ואז מוחקים הכול (גם אם נכשל)
//
// הרצה:   node 21-auth/starter/P21-E93.ts
// בדיקה:  npm run check P21-E93
