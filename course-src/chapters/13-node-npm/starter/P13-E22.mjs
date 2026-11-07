// P13-E22: מדליף סודות, לא נכשל, ונותן ברירת מחדל לסוד.
// חובה: DATABASE_URL, JWT_SECRET → Error(`חסר ${name}`)
// log: `config: ${JSON.stringify({ port, databaseUrl: "***", jwtSecret: "***" })}`
export function buildConfig(env, log = console.log) {
  const config = {
    port: Number(env.PORT ?? 3000),
    databaseUrl: String(env.DATABASE_URL),
    jwtSecret: env.JWT_SECRET ?? "dev-secret",
  };
  log(`config: ${JSON.stringify(config)}`);
  return config;
}
