// P13-E65: config מקונן וקפוא לגמרי
// כתוב וייצא (export function ...):
//   deepFreeze(obj) — מקפיאה את כל הרמות, ומחזירה את obj
//   buildConfig(env) → { server: { port, host }, db: { url, poolSize }, admins } קפוא לגמרי
//     PORT 1–65535 (3000) · HOST ("0.0.0.0") · DATABASE_URL חובה · DB_POOL_SIZE 1–100 (10)
//     ADMIN_EMAILS: פסיקים, קטנות, בלי ריקים · כל הבעיות: Error("הגדרות לא תקינות: PORT, DATABASE_URL")
//
// הרצה:   node 13-node-npm/starter/P13-E65.mjs
// בדיקה:  npm run check P13-E65
