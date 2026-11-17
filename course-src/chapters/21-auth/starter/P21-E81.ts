// P21-E81: CORS עם רשימה מפורשת (middleware של Express)
// כתוב וייצא corsAllowlist(allowed: string[]) ← (req, res, next)
//   תמיד Vary: Origin | origin ברשימה ← Allow-Origin: <origin> + Allow-Credentials: true (אף פעם לא *)
//   OPTIONS מותר ← Allow-Methods, Allow-Headers, 204 | OPTIONS לא מותר ← 403 | אחרת next()
//
// הרצה:   node 21-auth/starter/P21-E81.ts
// בדיקה:  npm run check P21-E81
