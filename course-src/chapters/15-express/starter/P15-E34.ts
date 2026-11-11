// P15-E34: X-Total-Count ובחירת שדות
// כתוב וייצא type Product = { id, name, price, stock } ו־createApp(products: Product[]):
//   GET /products → כל המוצרים + header X-Total-Count
//   ?fields=name,price → רק השדות האלה (id תמיד ראשון); שדה לא מוכר → 400 { error: "שדה לא מוכר: X" }
//
// הרצה:   node 15-express/starter/P15-E34.ts
// בדיקה:  npm run check P15-E34
