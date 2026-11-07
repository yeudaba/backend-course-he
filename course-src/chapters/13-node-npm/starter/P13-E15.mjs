// P13-E15
// loadConfig(env) → Object.freeze({ port, databaseUrl, jwtSecret, logLevel })
// כל הבעיות יחד: "הגדרות לא תקינות: DATABASE_URL חסר; JWT_SECRET קצר מדי"
// בעיות אפשריות (בסדר הזה): "DATABASE_URL חסר" | "JWT_SECRET חסר" / "JWT_SECRET קצר מדי" (פחות מ־32) | "PORT לא תקין" | "LOG_LEVEL לא תקין"
export function loadConfig(env) {
  // כתוב כאן
}

// עותק: שדות ששמם מכיל secret/password/url → "***"
export function redact(config) {
  // כתוב כאן
}
