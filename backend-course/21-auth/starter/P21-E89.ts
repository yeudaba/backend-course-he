// P21-E89: loadConfig עם Zod
// כתוב וייצא type AppConfig = { jwtSecret, accessTtlSeconds, refreshTtlDays, bcryptRounds } ו־loadConfig(env): AppConfig
//   JWT_SECRET (חובה, 32+) | ACCESS_TOKEN_TTL_SECONDS 30–3600 (900) | REFRESH_TOKEN_TTL_DAYS 1–90 (7) | BCRYPT_ROUNDS 4–15 (12)
//   לא תקין ← Error(`הגדרות לא תקינות: ${שמות המשתנים, מופרדים ב־", "}`) — בלי הערכים
//
// הרצה:   node 21-auth/starter/P21-E89.ts
// בדיקה:  npm run check P21-E89
