// P11-E85: מיון לפי שדה מה־URL
// כתוב וייצא (export), בלי any ובלי as:
//   export type Product = { id: number; name: string; price: number; stock: number };
//   sortProducts(products: Product[], sort: string): Product[]
//     sort: "price" (עולה) או "-price" (יורד). מותר: name, price, stock. מערך חדש, המקור לא משתנה.
//     שדה אחר ← throw new Error("שדה מיון לא מוכר: " + sort)
//
// הרצה:   node 11-typescript/starter/P11-E85.ts
// בדיקה:  npm run check P11-E85
