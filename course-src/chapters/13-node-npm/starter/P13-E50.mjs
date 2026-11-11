// P13-E50: כיבוי מסודר
// כתוב וייצא (export function ...):
//   onShutdown(proc, cleanups, log) → Promise שמסתיים כשהכיבוי הסתיים
//     proc.on("SIGINT" / "SIGTERM") → log(`התקבל ${signal}, סוגר...`), cleanups בסדר הפוך אחד אחרי השני
//     כישלון → log(`ניקוי נכשל: ${err.message}`) וממשיכים; בסוף proc.exitCode = 0/1 ו־log("סיום")
//     אות שני — מתעלמים
//
// הרצה:   node 13-node-npm/starter/P13-E50.mjs
// בדיקה:  npm run check P13-E50
