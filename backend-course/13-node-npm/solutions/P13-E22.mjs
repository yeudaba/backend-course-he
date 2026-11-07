// P13-E22: מתוקן
export function buildConfig(env, log = console.log) {
  for (const name of ["DATABASE_URL", "JWT_SECRET"]) {
    if (!env[name]) {
      throw new Error(`חסר ${name}`);
    }
  }
  const config = { port: Number(env.PORT ?? 3000), databaseUrl: env.DATABASE_URL, jwtSecret: env.JWT_SECRET };
  log(`config: ${JSON.stringify({ ...config, databaseUrl: "***", jwtSecret: "***" })}`);
  return config;
}

buildConfig({ DATABASE_URL: "postgres://u:pass@h/db", JWT_SECRET: "s" });
