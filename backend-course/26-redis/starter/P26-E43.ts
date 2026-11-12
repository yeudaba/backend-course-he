// P26-E43: Express — מונה צפיות ודירוג
// כתוב וייצא viewsApp(redis) ← אפליקציית Express:
//   POST /products/:id/view → { productId, views } (hash views + sorted set top, ב־MULTI)
//   GET  /products/top?n=3  → [{ productId, views }] (n: ברירת מחדל 5, 1–50)
//   id או n לא תקינים → 400 { error }
//
// בדיקה:  npm run check P26-E43
