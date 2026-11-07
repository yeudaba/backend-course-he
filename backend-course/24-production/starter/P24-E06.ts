// P24-E06: createLogger — שורת JSON אחת לכל אירוע
type Level = "debug" | "info" | "warn" | "error";

export interface LoggerOptions {
  level?: Level;
  sink?: (line: string) => void;
  clock?: () => Date;
  base?: Record<string, unknown>;
}

export function createLogger(options: LoggerOptions = {}) {
  // כתוב כאן: debug, info, warn, error, child
  return {
    debug(msg: string, fields?: Record<string, unknown>) {},
    info(msg: string, fields?: Record<string, unknown>) {},
    warn(msg: string, fields?: Record<string, unknown>) {},
    error(msg: string, fields?: Record<string, unknown>) {},
    child(fields: Record<string, unknown>) {
      return createLogger(options);
    },
  };
}
