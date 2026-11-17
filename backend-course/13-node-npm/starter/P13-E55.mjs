// P13-E55: כלי שסופר פריטים בקובץ JSON
// כתוב וייצא (export function ...):
//   async countItems(args, { log, error, readFile }) → קוד יציאה:
//     לא ארגומנט אחד → error("שימוש: count <file>"), 2
//     ENOENT → error(`הקובץ לא נמצא: ${file}`), 1 · לא מערך JSON → error(`${file}: צריך מערך JSON`), 1
//     הצלחה → log(`${file}: ${n} פריטים`), 0 · שגיאה אחרת — נזרקת
//
// הרצה:   node 13-node-npm/starter/P13-E55.mjs
// בדיקה:  npm run check P13-E55
