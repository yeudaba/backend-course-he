// P24-E87: הגבלה ל־login — לפי IP ולפי חשבון
// כתוב וייצא createLoginLimiter({ now, perIp?, perEmail? }) ← { check(ip, email), fail(email), succeed(email) }
//   ברירות מחדל: 20 ב־60 שניות ל־IP, 5 כישלונות ב־15 דקות לחשבון
//
// בדיקה:  npm run check P24-E87
