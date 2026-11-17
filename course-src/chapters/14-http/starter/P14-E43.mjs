// P14-E43: קישורי עמודים
// כתוב וייצא (export function ...):
//   pageLinks(url, total) → { page, limit, pages, prev, next }
//   page/limit מה־query (ברירת מחדל 1/10, לא חיובי שלם → ברירת מחדל, limit עד 100),
//   pages לפחות 1, prev/next — כתובות מלאות עם page אחר (שאר הפרמטרים נשמרים) או null
//
// הרצה:   node 14-http/starter/P14-E43.mjs
// בדיקה:  npm run check P14-E43
