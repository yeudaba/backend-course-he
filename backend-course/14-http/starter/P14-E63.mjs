// P14-E63: מפקודת curl לבקשה
// כתוב וייצא (export function ...):
//   parseCurlArgs(args) → { method, url, headers, body } — דגלים -X/--request, -H/--header, -d/--data;
//   -i -v -s מתעלמים; בלי -X: יש גוף → POST, אין → GET
//   דגל אחר → throw Error(`דגל לא מוכר: ${flag}`); אין כתובת → throw Error("חסרה כתובת")
//
// הרצה:   node 14-http/starter/P14-E63.mjs
// בדיקה:  npm run check P14-E63
