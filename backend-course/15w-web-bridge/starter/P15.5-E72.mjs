// P15.5-E72: לפרק CORS_ORIGINS
// כתוב וייצא (export function ...):
//   parseCorsOrigins(value, fallback = ["http://localhost:5500"]) → מערך origins (trim, נרמול, בלי כפילויות)
//   ריק → עותק של fallback; לא תקין → throw Error(`CORS_ORIGINS לא תקין: ${bad.join(", ")}`); * → throw
//
// הרצה:   node 15w-web-bridge/starter/P15.5-E72.mjs
// בדיקה:  npm run check P15.5-E72
