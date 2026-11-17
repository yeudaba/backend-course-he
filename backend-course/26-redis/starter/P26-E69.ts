// P26-E69: middleware של הגבלת קצב, משותף לשני שרתים
// כתוב וייצא rateLimit(redis, { limit, windowSeconds, keyOf = req => req.ip, now = Date.now })
//   fixed window: rl:<key>:<window> · INCR + EXPIRE NX ב־MULTI
//   X-RateLimit-Limit, X-RateLimit-Remaining · מעל המגבלה: 429 { error } + Retry-After (עיגול למעלה)
//
// בדיקה:  npm run check P26-E69
