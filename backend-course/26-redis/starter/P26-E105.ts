// P26-E105: GET /products עם X-Cache וביטול
// כתוב וייצא productsApp({ redis, loadProducts, ttl = 60 }) ← אפליקציית Express
//   GET /products?q= · q מנורמל · cache:products:<version>:<q> · X-Cache: HIT / MISS / OFF
//   POST /products/invalidate ← INCR v:products, ו־204
//
// בדיקה:  npm run check P26-E105
