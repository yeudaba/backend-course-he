// P08-E18
// חובה: DATABASE_URL, JWT_SECRET — אם חסר: Error("חסרות הגדרות: DATABASE_URL, JWT_SECRET") (רק החסרים, בסדר הזה)
// PORT: ברירת מחדל 3000, שלם בין 1 ל־65535, אחרת Error("PORT לא תקין")
// מחזירה { port, databaseUrl, jwtSecret }
function loadConfig(env) {
  // כתוב כאן
}

module.exports = { loadConfig };
