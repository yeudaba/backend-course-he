// P18-E52: mutex בזיכרון
// כתוב וייצא createMutex(): { run<T>(fn: () => Promise<T>): Promise<T>; pending(): number }
//   run — מריצה את fn רק אחרי שכל הקודמות הסתיימו; שגיאה לא עוצרת את התור
//   pending — כמה run עוד לא הסתיימו
//
// בדיקה:  npm run check P18-E52
