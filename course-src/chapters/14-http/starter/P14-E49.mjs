// P14-E49: פירוק שורת status
// כתוב וייצא (export function ...):
//   parseStatusLine(line) → { version, status, text } — "HTTP/1.1 404 Not Found" → { "1.1", 404, "Not Found" }
//   לא מתחיל ב־HTTP/ או status לא 3 ספרות 100–599 → throw Error(`שורת status לא תקינה: ${line}`)
//
// הרצה:   node 14-http/starter/P14-E49.mjs
// בדיקה:  npm run check P14-E49
