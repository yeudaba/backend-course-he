// P25-E103: בדיקת ההגדרות לפני deploy — מתוקן
export function prodEnvProblems(env: Record<string, string | undefined>): string[] {
  const problems: string[] = [];
  if (env.NODE_ENV !== "production") problems.push("NODE_ENV חייב להיות production");
  const db = env.DATABASE_URL ?? "";
  if (!db) problems.push("חסר DATABASE_URL");
  else if (new URL(db).searchParams.get("sslmode") !== "require") problems.push("DATABASE_URL בלי sslmode=require");
  const secret = env.JWT_SECRET ?? "";
  if (secret.length < 32 || secret === "change-me") problems.push("JWT_SECRET קצר מדי או ברירת מחדל");
  const origins = (env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (origins.length === 0 || origins.includes("*")) problems.push("CORS_ORIGINS חייב להיות רשימה מפורשת, בלי *");
  return problems;
}
