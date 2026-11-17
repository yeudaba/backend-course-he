// P13-E36: מה ישן? (npm outdated)
// כתוב וייצא (export function ...):
//   outdated(deps, latest) → [{ name, current, latest, type }] ממוין לפי שם
//     רק כש־latest גדולה מהנוכחית (השוואה מספרית); type = "major" / "minor" / "patch"
//     חבילה בלי ערך ב־latest — מדלגים
//
// הרצה:   node 13-node-npm/starter/P13-E36.mjs
// בדיקה:  npm run check P13-E36
