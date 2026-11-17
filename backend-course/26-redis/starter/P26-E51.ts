// P26-E51: cache-aside עם TTL אקראי
// כתוב וייצא async getOrSetJitter(redis, key, ttl, load, random = Math.random)
//   יש ב־Redis ← JSON.parse · אין ← load(), שמירה עם TTL של ttl + floor(random() * ttl * 0.2)
//   load זרק ← השגיאה עולה, ולא נשמר כלום
//
// בדיקה:  npm run check P26-E51
