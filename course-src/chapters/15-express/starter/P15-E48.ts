// P15-E48: X-Request-Id
// כתוב וייצא requestId() — מחזירה middleware:
//   X-Request-Id מהבקשה אם תקין (1–64 תווים: A-Z a-z 0-9 -), אחרת crypto.randomUUID()
//   → res.locals.requestId, header X-Request-Id בתשובה, ו־next()
//
// הרצה:   node 15-express/starter/P15-E48.ts
// בדיקה:  npm run check P15-E48
