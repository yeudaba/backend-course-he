// P15.5-E74: רק התשובה האחרונה
// כתוב וייצא (export function ...):
//   latestOnly(fn) → async (...args) → { stale: false, value } או { stale: true } אם התחילה קריאה חדשה יותר;
//   שגיאה בקריאה העדכנית — נזרקת, בישנה — { stale: true }
//
// הרצה:   node 15w-web-bridge/starter/P15.5-E74.mjs
// בדיקה:  npm run check P15.5-E74
