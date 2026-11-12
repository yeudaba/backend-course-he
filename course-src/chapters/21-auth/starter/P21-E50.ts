// P21-E50: jwtInfo — רק לתצוגה
// כתוב וייצא type JwtInfo = { alg, sub, role, secondsLeft, expired } ו־jwtInfo(token, nowSec): JwtInfo
//   לא 3 חלקים / JSON שבור ← throw new Error("טוקן לא תקין") | secondsLeft לא פחות מ־0 | expired: nowSec >= exp
//
// הרצה:   node 21-auth/starter/P21-E50.ts
// בדיקה:  npm run check P21-E50
