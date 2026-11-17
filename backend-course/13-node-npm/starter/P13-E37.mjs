// P13-E37: מה יש ב־lockfile
// כתוב וייצא (export function ...):
//   lockSummary(lock) → { total, prod, dev, versions, duplicates }
//     lock.packages: נתיב → { version, dev? } (המפתח "" — מדלגים)
//     versions: Map משם (אחרי node_modules/ האחרון) לגרסאות ממוינות בלי כפילויות
//     duplicates: שמות עם יותר מגרסה אחת, ממוינים
//
// הרצה:   node 13-node-npm/starter/P13-E37.mjs
// בדיקה:  npm run check P13-E37
