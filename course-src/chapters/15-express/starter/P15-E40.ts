// P15-E40: חיפוש לפי מק"ט עם Map
// כתוב וייצא type Product = { sku, name, price } ו־createApp(products: Product[]) — Map מ־sku (אותיות גדולות) למוצר:
//   GET /products/by-sku/:sku → מוצר או 404 { error: "לא נמצא: <sku>" }
//   GET /products/by-sku?skus=A,b,C → { found, missing } לפי הסדר, בלי כפילויות; בלי skus → 400 { error: "חסר skus" }
//
// הרצה:   node 15-express/starter/P15-E40.ts
// בדיקה:  npm run check P15-E40
