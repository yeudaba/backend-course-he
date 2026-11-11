// P15-E68: רשימה עם meta וקישורים
// כתוב וייצא createApp(products) עם GET /products?q&page&limit →
//   { data, meta: { page, limit, total, totalPages }, links: { self, next, prev } } (קישורים: /products?q=..&page=..&limit=..)
//   page/limit לא תקינים → 400 { error: { code: "VALIDATION_ERROR", message: "page או limit לא תקינים" } }
//
// הרצה:   node 15-express/starter/P15-E68.ts
// בדיקה:  npm run check P15-E68
