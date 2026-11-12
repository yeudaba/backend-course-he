// P26-E50: מפתח cache יציב
// כתוב וייצא cacheKey(group, params) → "group:" + JSON עם מפתחות ממוינים
//   בלי undefined/null ומחרוזות ריקות · מחרוזות אחרי trim · מערכים — עותק ממוין (ריק — לא נכנס)
//   cacheKey("products", { q: " V60 ", page: 1, tags: ["b", "a"] }) → products:{"page":1,"q":"V60","tags":["a","b"]}
//
// בדיקה:  npm run check P26-E50
