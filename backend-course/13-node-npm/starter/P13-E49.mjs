// P13-E49: CLI שמסכם מספרים
// כתוב וייצא (export function ...):
//   runSum(args, { log, error }) → קוד יציאה:
//     אין ארגומנטים → error("שימוש: sum <מספרים...>"), 2
//     לא מספר → error(`"<arg>" אינו מספר`), 1 (בלי סכום) · אחרת log(סכום), 0
//   ובסוף הקובץ: if (import.meta.main) { process.exitCode = runSum(process.argv.slice(2), { log: console.log, error: console.error }); }
//
// הרצה:   node 13-node-npm/starter/P13-E49.mjs
// בדיקה:  npm run check P13-E49
