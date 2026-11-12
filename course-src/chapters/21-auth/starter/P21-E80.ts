// P21-E80: parsePaging עם Zod
// כתוב וייצא pagingSchema ו־parsePaging(query) ← { ok: true, limit, offset } | { ok: false, errors }
//   limit 1–50 (ברירת מחדל 20; "limit מ־1", "limit עד 50") | offset 0–10000 (ברירת מחדל 0; "offset עד 10000")
//
// הרצה:   node 21-auth/starter/P21-E80.ts
// בדיקה:  npm run check P21-E80
