// P12-E67: חיפוש מוצרים עם עמודים
// כתוב וייצא (export):
//   type Product = { id; name; price } · interface ProductRepository { findAll(): Promise<Product[]> }
//   class SearchService — constructor(repo)
//     async search({ text?, minPrice?, maxPrice?, page = 1, pageSize = 10 }): Promise<{ items; total }>
//     text מכיל (לא רגיש לאותיות), מחירים כולל קצוות, מיון מחיר ↑ ואז name; total לפני העמוד
//
// הרצה:   node 12-design/starter/P12-E67.ts
// בדיקה:  npm run check P12-E67
