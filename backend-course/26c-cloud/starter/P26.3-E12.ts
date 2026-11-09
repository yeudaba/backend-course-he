// P26.3-E12: הגדרות מ־env, עם המוסכמה *_FILE לסודות
export interface AppConfig {
  databaseUrl: string;
  jwtSecret: string;
  redisUrl: string;
  port: number;
}

type ReadFile = (path: string) => string;

export function loadConfig(env: Record<string, string | undefined>, readFile: ReadFile): AppConfig {
  throw new Error("עוד לא כתבת את הפתרון");
}
