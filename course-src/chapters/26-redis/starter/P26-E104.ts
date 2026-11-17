// P26-E104: config של Redis עם zod
// כתוב וייצא loadRedisConfig(env) → { redis?: { url, prefix }, productsCacheTtlSeconds, orderPaymentTimeoutSeconds, runWorker }
//   REDIS_URL (redis:// או rediss://) · REDIS_PREFIX (shop) · TTL (60) · TIMEOUT (1800) · WORKER true/false (true)
//   לא תקין ← Error("הגדרות לא תקינות — ...") עם כל המשתנים הבעייתיים
//
// בדיקה:  npm run check P26-E104
