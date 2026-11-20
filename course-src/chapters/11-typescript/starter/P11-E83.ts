// P11-E83: אילו שדות השתנו?
// כתוב וייצא (export), בלי any ובלי as:
//   changedFields<T>(before: T, after: T, fields: (keyof T)[]): (keyof T)[]
//     השדות מתוך fields שהערך שלהם שונה (!==) בין before ל־after, לפי הסדר ב־fields.
//
// הרצה:   node 11-typescript/starter/P11-E83.ts
// בדיקה:  npm run check P11-E83
