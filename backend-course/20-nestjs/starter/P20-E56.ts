// P20-E56: עמודים עם קישורים — next ו־prev
// כתוב וייצא ListArticlesQuery (page ≥ 1 = 1, limit 1–20 = 5, q?), ArticlesController, ArticlesModule
//   GET /articles ← { data, meta: { page, limit, total, pages }, links: { self, next, prev } }
//   קישור: /articles?q=...&page=..&limit=.. (q רק אם נשלח; URLSearchParams)
//
// בדיקה:  npm run check P20-E56
