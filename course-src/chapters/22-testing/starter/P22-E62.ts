// P22-E62: withRollback
// כתוב וייצא withRollback(pool, fn) — pool.connect, BEGIN, fn(client), ותמיד ROLLBACK
//   מחזיר את מה ש־fn החזירה | שגיאה ← אותה שגיאה, אחרי ROLLBACK | release תמיד
//
// הרצה:   node 22-testing/starter/P22-E62.ts
// בדיקה:  npm run check P22-E62
