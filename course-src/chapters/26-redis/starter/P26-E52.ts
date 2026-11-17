// P26-E52: גם "אין" נשמר — negative caching
// כתוב וייצא async findProduct(redis, id, loadFromDb, { ttl = 300, missTtl = 30 } = {})
//   מפתח product:<id> · מוצר ← JSON עם ttl · המסד החזיר null ← "__none__" עם missTtl, ומחזירים null
//   "__none__" ב־Redis ← null בלי ללכת למסד
//
// בדיקה:  npm run check P26-E52
