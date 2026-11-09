// P26.3-E12: הגדרות מ־env, עם המוסכמה *_FILE לסודות (Kubernetes Secret שמורכב כקובץ)
export interface AppConfig {
  databaseUrl: string;
  jwtSecret: string;
  redisUrl: string;
  port: number;
}

type ReadFile = (path: string) => string;

const REQUIRED = { databaseUrl: "DATABASE_URL", jwtSecret: "JWT_SECRET", redisUrl: "REDIS_URL" } as const;

export function readSetting(env: Record<string, string | undefined>, name: string, readFile: ReadFile): string | undefined {
  const direct = env[name];
  const file = env[`${name}_FILE`];
  if (direct !== undefined && file !== undefined) throw new Error(`${name} ו־${name}_FILE מוגדרים שניהם — בחר אחד`);
  if (file !== undefined) {
    let text: string;
    try {
      text = readFile(file);
    } catch {
      throw new Error(`${name}_FILE: אי אפשר לקרוא את ${file}`);
    }
    const value = text.replace(/\r?\n$/, "");
    if (!value) throw new Error(`${name}_FILE: הקובץ ${file} ריק`);
    return value;
  }
  return direct === "" ? undefined : direct;
}

export function loadConfig(env: Record<string, string | undefined>, readFile: ReadFile): AppConfig {
  const missing: string[] = [];
  const out: Record<string, string> = {};
  for (const [key, name] of Object.entries(REQUIRED)) {
    const v = readSetting(env, name, readFile);
    if (v === undefined) missing.push(name);
    else out[key] = v;
  }
  if (missing.length) throw new Error(`חסרות הגדרות: ${missing.join(", ")}`);
  const port = Number(env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`PORT לא תקין: ${env.PORT}`);
  return { databaseUrl: out.databaseUrl, jwtSecret: out.jwtSecret, redisUrl: out.redisUrl, port };
}
