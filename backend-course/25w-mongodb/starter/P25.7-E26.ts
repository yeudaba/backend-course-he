// P25.7-E26: חיפוש מוצרים מ־query string — מקובץ ריק
// כתוב וייצא:
//   buildProductFilter(query: Record<string, string | undefined>) → פילטר של Mongo
//     q ← name: { $regex: <q אחרי trim, עם escape>, $options: "i" } · category ← category
//     minPrice / maxPrice ← price: { $gte, $lte } (מספרים, לא שליליים; אחרת או min > max ← RangeError)
//     tags "a, b" ← tags: { $all: ["a", "b"] } · inStock "true" ← stock: { $gt: 0 }, "false" ← stock: 0, אחר ← RangeError
//     ערך ריק — בלי תנאי · מפתחות אחרים — מתעלמים
//   async searchProducts(db: Db, query) → שמות המוצרים שמתאימים, ממוינים לפי name
//
// הרצה:   node 25w-mongodb/starter/P25.7-E26.ts
// בדיקה:  npm run check P25.7-E26
