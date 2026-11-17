// P21-E54: guard שמקבל Bearer או cookie
// כתוב וייצא SECRET = "p21-e54-secret-at-least-32-chars!!", JwtAuthGuard, MeController, AppModule (JwtModule.register)
//   יש Authorization ← רק ממנו (Bearer, אחרת 401 "נדרשת התחברות") | אין ← cookie access_token (אין ← 401 "נדרשת התחברות")
//   verifyAsync נכשל ← 401 "טוקן לא תקין" | req.user = { id: sub, role } | GET /me (מוגן), GET /hello ← { hello: "world" }
//
// בדיקה:  npm run check P21-E54
