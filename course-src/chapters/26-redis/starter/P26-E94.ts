// P26-E94: מפתח הקטלוג מתוך DTO עם zod
// כתוב וייצא productsCacheKey(query) → JSON בסדר קבוע: q (רק אם יש), sort, page, limit
//   sort: newest | price_asc | price_desc (newest) · page ≥ 1 (1) · limit 1–50 (20) · לא תקין ← Error("VALIDATION_ERROR")
//
// בדיקה:  npm run check P26-E94
