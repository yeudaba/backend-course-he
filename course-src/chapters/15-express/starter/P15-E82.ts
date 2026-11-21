// P15-E82: פרמטרים של רשימה — בלי Zod
// כתוב וייצא:
//   type ListQuery = { page: number; limit: number; offset: number; sort: string; order: "asc" | "desc" }
//   type Issue = { path: string; message: string }
//   parseListQuery(query: Record<string, unknown>, allowedSort: string[])
//     ← { ok: true, value: ListQuery }  או  { ok: false, error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details: Issue[] } }
//   page: ברירת מחדל 1, רק ספרות, ≥ 1      ← "page חייב להיות מספר שלם חיובי"
//   limit: ברירת מחדל 20, רק ספרות, 1–100   ← "limit חייב להיות בין 1 ל־100"
//   sort: ברירת מחדל allowedSort[0]; "-price" ← יורד; שדה לא ברשימה ← "אפשר למיין לפי: price, name"
//   ערך שאינו מחרוזת (למשל מערך מ־?page=1&page=2) — לא תקין. כל הבעיות יחד, בסדר page, limit, sort
//
// הרצה:   node 15-express/starter/P15-E82.ts
// בדיקה:  npm run check P15-E82
