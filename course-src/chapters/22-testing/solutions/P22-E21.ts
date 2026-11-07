// P22-E21 — הקוד שבודקים (לא משנים אותו)
export class ConfigError extends Error {}

export interface Config {
  port: number;
  debug: boolean;
  appName: string;
  allowedOrigins: string[];
}

// הגדרות מה־env. ברירות מחדל: port 3000, debug false, allowedOrigins []
export function parseConfig(env: Record<string, string | undefined>): Config {
  const appName = env.APP_NAME?.trim();
  if (!appName) throw new ConfigError("APP_NAME חובה");
  const port = env.PORT === undefined ? 3000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigError(`PORT לא תקין: ${env.PORT}`);
  if (env.DEBUG !== undefined && env.DEBUG !== "true" && env.DEBUG !== "false") throw new ConfigError("DEBUG: true או false");
  const allowedOrigins = (env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return { port, debug: env.DEBUG === "true", appName, allowedOrigins };
}
