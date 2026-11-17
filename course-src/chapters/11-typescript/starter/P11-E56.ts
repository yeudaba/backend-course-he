// P11-E56: אינדקס לפי מזהה
// כתוב וייצא (export):
//   type Product = { id: number; name: string; price: number }
//   indexById(products): Map<number, Product> — מזהה כפול → Error("מזהה כפול: <id>")
//   missingIds(ids: number[], index): number[] — בלי מוצר, לפי הסדר, בלי כפילויות
//   orderTotal(lines: { id: number; qty: number }[], index): number — חסר → Error("אין מוצר <id>")
//
// הרצה:   node 11-typescript/starter/P11-E56.ts
// בדיקה:  npm run check P11-E56
