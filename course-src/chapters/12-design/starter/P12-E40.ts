// P12-E40: תור משימות אסינכרוני
// כתוב וייצא (export):
//   class TaskQueue:
//     add<T>(task: () => Promise<T>): Promise<T> — משימה מתחילה רק אחרי שהקודמת הסתיימה (גם אם נכשלה)
//     get pending — כמה משימות עוד לא הסתיימו
//
// הרצה:   node 12-design/starter/P12-E40.ts
// בדיקה:  npm run check P12-E40
