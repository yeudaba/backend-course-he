// P13-E15
const LEVELS = ["debug", "info", "warn", "error"];

export function loadConfig(env) {
  const problems = [];
  if (!env.DATABASE_URL) problems.push("DATABASE_URL חסר");
  if (!env.JWT_SECRET) problems.push("JWT_SECRET חסר");
  else if (env.JWT_SECRET.length < 32) problems.push("JWT_SECRET קצר מדי");
  const port = env.PORT === undefined ? 3000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) problems.push("PORT לא תקין");
  const logLevel = env.LOG_LEVEL ?? "info";
  if (!LEVELS.includes(logLevel)) problems.push("LOG_LEVEL לא תקין");
  if (problems.length > 0) {
    throw new Error(`הגדרות לא תקינות: ${problems.join("; ")}`);
  }
  return Object.freeze({ port, databaseUrl: env.DATABASE_URL, jwtSecret: env.JWT_SECRET, logLevel });
}

export function redact(config) {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => [k, /secret|password|url/i.test(k) ? "***" : v])
  );
}

try {
  loadConfig({ JWT_SECRET: "short" });
} catch (err) {
  console.log(err.message);
}
console.log(redact(loadConfig({ DATABASE_URL: "postgres://u:p@h/db", JWT_SECRET: "x".repeat(32) })));
