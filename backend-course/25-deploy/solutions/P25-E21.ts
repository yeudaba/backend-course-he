// P25-E21
export function loadConfig(env: Record<string, string | undefined>) {
  const production = env.NODE_ENV === "production";
  // תקלה 1: בפרודקשן בלי JWT_SECRET — השרת עלה עם "dev-secret", וכל אחד יכול לחתום טוקנים
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) throw new Error("JWT_SECRET חובה בפרודקשן (32+ תווים)");
  return {
    production,
    jwtSecret: env.JWT_SECRET ?? "dev-secret",
    // תקלה 2: ב־env הכול מחרוזות. "true" === true הוא תמיד false
    debug: env.DEBUG === "true" || env.DEBUG === "1",
    // תקלה 3: "https://a.com, https://b.com" ← " https://b.com" עם רווח, שלא שווה ל־Origin של הדפדפן
    corsOrigins: (env.CORS_ORIGINS ?? "http://localhost:5500").split(",").map((o) => o.trim()).filter(Boolean),
  };
}
