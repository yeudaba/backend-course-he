// P24-E100: guard של הגבלת קצב ב־Nest
// כתוב וייצא class LoginRateLimitGuard — constructor(limitPerMinute, clock); canActivate(context)
//   חלון נע של 60 שניות לפי req.ip; RateLimit-* בכל תשובה; חסום ← Retry-After ו־HttpException 429
//
// בדיקה:  npm run check P24-E100
