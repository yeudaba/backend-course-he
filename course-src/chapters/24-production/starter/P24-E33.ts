// P24-E33: התראה על שיעור שגיאות — חזרה על class פרטי, getters, while ושעון מוזרק
// כתוב וייצא class ErrorRateAlarm:
//   constructor({ windowMs, threshold, minRequests }, now = () => Date.now()) — threshold בין 0 (לא כולל) ל־1, אחרת RangeError
//   record(status) — שגיאה = status >= 500
//   get count | get errorRate (0 כשאין) — רק בקשות שזמנן > now() - windowMs
//   shouldAlert() — count >= minRequests && errorRate >= threshold
//   #prune() עם while מוחק בקשות ישנות מהזיכרון. כל השדות פרטיים (#)
//
// הרצה:   node 24-production/starter/P24-E33.ts
// בדיקה:  npm run check P24-E33
