// P08-E18: טעינת הגדרות — להיכשל מוקדם
const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];

function loadConfig(env) {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`חסרות הגדרות: ${missing.join(", ")}`);
  }
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT לא תקין");
  }
  return { port, databaseUrl: env.DATABASE_URL, jwtSecret: env.JWT_SECRET };
}

try {
  loadConfig({ PORT: "8080" });
} catch (err) {
  console.log(err.message);
}
console.log(loadConfig({ DATABASE_URL: "postgres://...", JWT_SECRET: "s3cret" }));

module.exports = { loadConfig };
