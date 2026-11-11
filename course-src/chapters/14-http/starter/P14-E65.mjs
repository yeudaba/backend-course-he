// P14-E65: לפרק פלט של curl -v
// כתוב וייצא (export function ...):
//   parseVerbose(text) → { request: { method, path, headers } | null, response: { status, headers } | null }
//   שורות "> " — בקשה, "< " — תשובה; שמות headers באותיות קטנות; שאר השורות — מתעלמים
//
// הרצה:   node 14-http/starter/P14-E65.mjs
// בדיקה:  npm run check P14-E65
