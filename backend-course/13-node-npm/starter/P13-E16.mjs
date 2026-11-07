// P13-E16: configFor(env) → { env, databaseUrl, logLevel, cors } לפי NODE_ENV (ברירת מחדל development)
// development: postgres://localhost:5432/app_dev, debug, "*"
// test: postgres://localhost:5432/app_test, error, "*"
// production: DATABASE_URL + CORS_ORIGIN חובה (Error(`${name} חובה ב־production`)), info, cors = CORS_ORIGIN
// NODE_ENV אחר → Error(`NODE_ENV לא מוכר: ${v}`) | משתנה מפורש גובר על ברירת מחדל
export function configFor(env) {
  // כתוב כאן
}
