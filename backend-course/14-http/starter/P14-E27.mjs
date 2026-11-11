// P14-E27: סטטיסטיקת בקשות כמחלקה — חזרה על class, Map ו־sort
// כתוב וייצא class RequestStats:
//   record(method, path, status, ms) — route = `${method} ${path}`
//   get total — כמה בקשות נרשמו
//   summary() → [{ route, count, avgMs, errors }]  (avgMs = Math.round של הממוצע; errors = status >= 500)
//            ממוין לפי count יורד, ובתיקו לפי route (א״ב)
//   הנתונים בשדה פרטי (#), ב־Map.
//
// הרצה:   node 14-http/starter/P14-E27.mjs
// בדיקה:  npm run check P14-E27
