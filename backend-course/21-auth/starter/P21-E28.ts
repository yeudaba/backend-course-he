// P21-E28: רשימת חסימה לטוקנים — חזרה על class, Map ושעון מוזרק
// כתוב וייצא class TokenBlocklist:
//   constructor(now = () => Math.floor(Date.now() / 1000))
//   block(jti, exp) — טוקן שכבר פג לא נשמר | isBlocked(jti) — ברשימה ועוד לא פג
//   cleanup() — מוחקת את מה שפג ומחזירה כמה | get size | שדות פרטיים (#)
//
// הרצה:   node 21-auth/starter/P21-E28.ts
// בדיקה:  npm run check P21-E28
