// P15-E35: מונים בשם
// כתוב וייצא createApp():
//   POST /counters/:name/increment { by? } → { name, value } (by שלם 1–100, ברירת מחדל 1; אחרת 400)
//   GET /counters/:name → { name, value } (לא קיים → 0); DELETE → 204 / 404 { error: "אין מונה כזה" }
//
// הרצה:   node 15-express/starter/P15-E35.ts
// בדיקה:  npm run check P15-E35
