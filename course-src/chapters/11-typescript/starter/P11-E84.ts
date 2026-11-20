// P11-E84: groupBy עם טיפוס מדויק
// כתוב וייצא (export), בלי any ובלי as:
//   groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]>
//     ערך של השדה key ← מערך הפריטים עם הערך הזה (לפי הסדר). מפתחות לפי ההופעה הראשונה.
//
// הרצה:   node 11-typescript/starter/P11-E84.ts
// בדיקה:  npm run check P11-E84
