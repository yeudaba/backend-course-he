// P08-E100: סיכום של קובץ לוג (מודול ES)
// export function summarizeLog(text) ← { total, skipped, byStatus, slowest }
// כל שורה בפורמט של P08-E84: "2026-11-19T08:30:00Z GET /tasks/42 200 13ms".
// - שורות ריקות — לא נספרות בכלל. שורה שלא בפורמט ← skipped.
// - total: מספר השורות התקינות. byStatus: { "200": 3, "404": 1 } (מפתח = הסטטוס כמחרוזת).
// - slowest: { path, ms } של השורה עם ה־ms הגבוה ביותר (בתיקו — הראשונה). אין שורות תקינות ← null.
// - ירידת שורה: \n או \r\n.
//
// הרצה:   node 08-modules-errors/starter/P08-E100.mjs
// בדיקה:  npm run check P08-E100
