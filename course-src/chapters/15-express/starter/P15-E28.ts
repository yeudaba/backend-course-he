// P15-E28: סכום עגלה — חזרה על Map ו־reduce
// כתוב וייצא type Product = { name: string; price: number } ו־createApp(catalog: Map<string, Product>):
//   POST /cart/total { items: [{ sku, qty }] } → { lines: [{ sku, name, qty, subtotal }], total }
//   Zod: לפחות פריט אחד, sku לא ריק, qty שלם 1–99 → אחרת 400 { error: "קלט לא תקין" }
//   אותו sku כמה פעמים → שורה אחת (Map). sku לא בקטלוג → 404 { error: "מוצר לא קיים: X" }. total עם reduce.
//
// הרצה:   node 15-express/starter/P15-E28.ts
// בדיקה:  npm run check P15-E28
