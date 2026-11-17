// P25-E96: ההגדרות ב־Render — מה חסר?
export function renderEnvProblems(env: Record<string, string>): string[] {
  const p: string[] = [];
  const db = env.DATABASE_URL;
  if (!db) p.push("DATABASE_URL: חסר");
  else if (!/[?&]sslmode=require(&|$)/.test(db)) p.push("DATABASE_URL: חסר sslmode=require");
  if (!env.JWT_SECRET) p.push("JWT_SECRET: חסר");
  else if (env.JWT_SECRET.length < 32) p.push("JWT_SECRET: קצר מ־32 תווים");
  const cors = env.CORS_ORIGINS;
  if (!cors) p.push("CORS_ORIGINS: חסר");
  else if (cors.split(",").map((s) => s.trim()).some((o) => !/^https:\/\/[^/*\s]+$/.test(o))) p.push("CORS_ORIGINS: רק https://host, בלי נתיב");
  if (env.TRUST_PROXY !== "1") p.push("TRUST_PROXY: ב־Render יש proxy אחד — 1");
  if ("PORT" in env) p.push("PORT: Render קובע לבד");
  if ("NODE_ENV" in env && env.NODE_ENV !== "production") p.push("NODE_ENV: רק production (או לא להגדיר)");
  if ("RENDER_GIT_COMMIT" in env) p.push("RENDER_GIT_COMMIT: Render קובע לבד");
  return p;
}
