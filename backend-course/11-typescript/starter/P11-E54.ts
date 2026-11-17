// P11-E54: מחירון במקביל — עם טיפוסים
// כתוב וייצא (export):
//   type Product = { id: number; name: string; price: number }
//   loadProducts(ids, getOne: (id: number) => Promise<Product>): Promise<Product[]> — במקביל, לפי סדר ה־ids
//   cheapest(ids, getOne): Promise<Product | null> — הזול ביותר (בשוויון הראשון), null אם ids ריק
//
// הרצה:   node 11-typescript/starter/P11-E54.ts
// בדיקה:  npm run check P11-E54
