// P13-E16
const DEFAULTS = {
  development: { databaseUrl: "postgres://localhost:5432/app_dev", logLevel: "debug", cors: "*" },
  test: { databaseUrl: "postgres://localhost:5432/app_test", logLevel: "error", cors: "*" },
  production: { logLevel: "info" },
};

export function configFor(env) {
  const name = env.NODE_ENV ?? "development";
  const defaults = DEFAULTS[name];
  if (!defaults) {
    throw new Error(`NODE_ENV לא מוכר: ${name}`);
  }
  if (name === "production") {
    for (const key of ["DATABASE_URL", "CORS_ORIGIN"]) {
      if (!env[key]) throw new Error(`${key} חובה ב־production`);
    }
  }
  return {
    env: name,
    databaseUrl: env.DATABASE_URL ?? defaults.databaseUrl,
    logLevel: env.LOG_LEVEL ?? defaults.logLevel,
    cors: env.CORS_ORIGIN ?? defaults.cors,
  };
}

console.log(configFor({}));
console.log(configFor({ NODE_ENV: "production", DATABASE_URL: "postgres://prod/db", CORS_ORIGIN: "https://shop.example.com" }));
