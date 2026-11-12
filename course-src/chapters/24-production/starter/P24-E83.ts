// P24-E83: סדר הכיבוי
// כתוב וייצא createShutdown({ setReady, closeServer, closeDb, exit, log, timeoutMs, delay? }) ← (signal) => Promise<void>
//   log ← setReady(false) ← closeServer (עד timeoutMs) ← closeDb ← exit(0 או 1); קריאה שנייה — אותה Promise
//
// בדיקה:  npm run check P24-E83
