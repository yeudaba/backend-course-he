// P16-E27: בונה שאילתות עם פרמטרים — חזרה על switch ו־type
// כתוב וייצא type ProductFilters (category?, minPrice?, maxPrice?, search?, inStock?, sort?: "price" | "-price" | "name", limit?)
// ו־buildProductQuery(filters) → { text, values }:
//   "SELECT id, name, price FROM products WHERE is_active" + AND לכל מסנן, לפי הסדר:
//   category = $n | price >= $n | price <= $n | name ILIKE $n (%search%) | stock > 0 / stock = 0
//   ORDER BY (switch): price → "price, id" | -price → "price DESC, id" | name → "name" | בלי → "id" | אחר → Error(`מיון לא מוכר: ${sort}`)
//   LIMIT $n — רק אם יש limit. ערכים מהמשתמש — רק כפרמטרים, אף פעם בתוך הטקסט.
//
// הרצה:   node 16-sql/starter/P16-E27.ts
// בדיקה:  npm run check P16-E27
