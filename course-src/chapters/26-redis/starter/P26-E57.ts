// P26-E57: middleware של cache ל־Express
// כתוב וייצא cacheMiddleware(redis, ttl) ← (req, res, next) => ...
//   רק GET · עם Authorization ← X-Cache: BYPASS · מפתח page:<originalUrl>
//   HIT ← X-Cache: HIT והגוף השמור · MISS ← X-Cache: MISS, ושמירה של res.json(...) רק בסטטוס 200
//
// בדיקה:  npm run check P26-E57
