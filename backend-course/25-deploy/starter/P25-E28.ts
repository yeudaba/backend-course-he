// P25-E28: mapLimit — חזרה על async/await, closure, while ו־Promise.all
// כתוב וייצא async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]>
//   לכל היותר limit קריאות ל־fn רצות במקביל · התוצאות בסדר של items
//   fn נכשלה ← mapLimit נדחית עם אותה שגיאה, ולא מתחילים פריטים חדשים · limit לא שלם חיובי ← RangeError
//
// הרצה:   node 25-deploy/starter/P25-E28.ts
// בדיקה:  npm run check P25-E28
