// P26-E32: לקרוא את INFO של Redis — חזרה על split, indexOf/slice, Object.entries/fromEntries
// כתוב וייצא:
//   parseInfo(text) → { server: { redis_version: "8.2.1", ... }, stats: {...}, ... }
//     "# Server" פותח מקטע (שם באותיות קטנות) · "key:value" — לפי הנקודתיים הראשונות · שורות מסתיימות ב־\r\n
//   parseKeyspace(info) → { db0: { keys: 1204, expires: 980, ... } } — מתוך info.keyspace, מספרים
//   hitRatio(info) → hits / (hits + misses) מעוגל ל־3 ספרות, או null אם אין נתונים
//
// הרצה:   node 26-redis/starter/P26-E32.ts
// בדיקה:  npm run check P26-E32
