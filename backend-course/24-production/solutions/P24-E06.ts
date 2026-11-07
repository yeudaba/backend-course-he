// P24-E06
type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerOptions {
  level?: Level;
  sink?: (line: string) => void;
  clock?: () => Date;
  base?: Record<string, unknown>;
}

export function createLogger({ level = "info", sink = (l) => process.stdout.write(l + "\n"), clock = () => new Date(), base = {} }: LoggerOptions = {}) {
  const write = (lvl: Level, msg: string, fields: Record<string, unknown> = {}) => {
    if (ORDER[lvl] < ORDER[level]) return; // מתחת לרמה — לא כותבים בכלל
    // time, level ו־msg קודם — ואחריהם השדות. שדה בשם level ב־fields לא ידרוס את הרמה האמיתית
    sink(JSON.stringify({ ...base, ...fields, time: clock().toISOString(), level: lvl, msg }));
  };
  return {
    debug: (msg: string, fields?: Record<string, unknown>) => write("debug", msg, fields),
    info: (msg: string, fields?: Record<string, unknown>) => write("info", msg, fields),
    warn: (msg: string, fields?: Record<string, unknown>) => write("warn", msg, fields),
    error: (msg: string, fields?: Record<string, unknown>) => write("error", msg, fields),
    // logger "ילד": אותן הגדרות, ועוד שדות קבועים (למשל requestId) בכל שורה
    child: (fields: Record<string, unknown>) => createLogger({ level, sink, clock, base: { ...base, ...fields } }),
  };
}
