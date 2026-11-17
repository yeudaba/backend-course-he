// P17-E67: דוח עם קיבוץ לבחירה
// כתוב וייצא:
//   ReportQuery — סכמת Zod: by ("city" | "status" | "month"), minOrders (coerce, שלם ≥ 1, ברירת מחדל 1)
//   buildReport(query: unknown): { text, values } — עמודות key, orders; HAVING orders >= $1; מיון orders יורד, key
//
// בדיקה:  npm run check P17-E67
