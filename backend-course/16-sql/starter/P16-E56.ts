// P16-E56: חיפוש מוצרים מ־Node
// כתוב וייצא async function searchProducts(client, { q, category, limit = 10 }) → [{ id, name, price: number }]
//   פעילים בלבד; q → name ILIKE (עם escape ל־% _ \); category → =; ORDER BY name, id; LIMIT (1–50, אחרת throw)
//   כל ערך — כפרמטר $1, $2...
//
// בדיקה:  npm run check P16-E56
