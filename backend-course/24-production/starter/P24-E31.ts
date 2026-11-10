// P24-E31: דוח latency מלוגים של JSON
// כתוב וייצא:
//   routeOf(method, path) — "GET /tasks/:id/comments": מתודה באותיות גדולות, בלי query, קטע של ספרות בלבד ← :id
//   routeReport(lines: string[]) → { routes, skipped }
//     נספרות רק שורות JSON עם msg === "request" ו־ms מספרי; כל השאר ← skipped
//     routes: { route, count, errorPct (status >= 500, ספרה אחת אחרי הנקודה), p95 (nearest-rank) }
//     מיון: p95 מהגבוה לנמוך, ובתיקו לפי route
//
// הרצה:   node 24-production/starter/P24-E31.ts
// בדיקה:  npm run check P24-E31
