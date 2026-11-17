// P13-E71: הסתרת סודות בכל עומק
// כתוב וייצא (export function ...):
//   redact(value) → עותק עמוק: מפתח שמכיל password/secret/token/key (בלי תלות באותיות) → "***"
//     ובכל מחרוזת: scheme://user:pass@... → scheme://user:***@... · אסור לשנות את המקור
//
// הרצה:   node 13-node-npm/starter/P13-E71.mjs
// בדיקה:  npm run check P13-E71
