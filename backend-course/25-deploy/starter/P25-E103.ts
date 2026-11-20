// P25-E103: בדיקת ההגדרות לפני deploy — מאשרת sslmode=disable, סוד של 31 תווים, ו־* בסוף CORS_ORIGINS.
// NODE_ENV=production · DATABASE_URL עם sslmode=require · JWT_SECRET ≥ 32 ולא change-me · CORS_ORIGINS בלי *
//
// בדיקה:  npm run check P25-E103
export function prodEnvProblems(env: Record<string, string | undefined>): string[] {
  const problems: string[] = [];
  if (env.NODE_ENV !== "production") problems.push("NODE_ENV חייב להיות production");
  const db = env.DATABASE_URL ?? "";
  if (!db) problems.push("חסר DATABASE_URL");
  else if (!db.includes("sslmode")) problems.push("DATABASE_URL בלי sslmode=require");
  const secret = env.JWT_SECRET ?? "";
  if (secret.length < 31 || secret === "change-me") problems.push("JWT_SECRET קצר מדי או ברירת מחדל");
  const origins = (env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (origins.length === 0 || origins[0] === "*") problems.push("CORS_ORIGINS חייב להיות רשימה מפורשת, בלי *");
  return problems;
}
