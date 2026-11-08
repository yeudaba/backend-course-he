import { Inject, Injectable, type LoggerService } from "@nestjs/common";
import { CLOCK, CONFIG, type AppConfig, type Clock } from "../config";
import { currentRequest } from "./request-context";

// לאן נכתבות השורות. ברירת מחדל: stdout (Docker, והפלטפורמות בפרק 25, אוספות משם). בבדיקות — מערך
export const LOG_SINK = "LOG_SINK";
export type LogSink = (line: string) => void;

type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

// שדות שלעולם לא נכתבים ללוג — גם אם מישהו מעביר בטעות את כל ה־body
const SECRET_KEYS = /^(password|passwordhash|token|accesstoken|refreshtoken|authorization|cookie|secret|jwtsecret)$/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SECRET_KEYS.test(k) ? "[REDACTED]" : redact(v, depth + 1)]));
}

// לוג מובנה: שורת JSON אחת לכל אירוע, עם זמן, רמה ו־requestId של הבקשה הנוכחית.
// מממש גם את LoggerService של Nest — כך גם ההודעות של Nest עצמו יוצאות כ־JSON.
@Injectable()
export class AppLogger implements LoggerService {
  constructor(
    @Inject(LOG_SINK) private readonly sink: LogSink,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  write(level: Level, msg: string, fields: Record<string, unknown> = {}) {
    if (ORDER[level] < ORDER[this.config.logLevel]) return;
    const ctx = currentRequest();
    const entry = {
      time: this.clock.now().toISOString(),
      level,
      msg,
      ...(ctx ? { requestId: ctx.requestId, ...(ctx.userId ? { userId: ctx.userId } : {}) } : {}),
      ...(redact(fields) as Record<string, unknown>),
    };
    this.sink(JSON.stringify(entry));
  }

  debug(msg: string, fields?: Record<string, unknown>) {
    this.write("debug", String(msg), typeof fields === "object" ? fields : { context: fields });
  }
  info(msg: string, fields?: Record<string, unknown>) {
    this.write("info", msg, fields);
  }
  warn(msg: string, fields?: Record<string, unknown> | string) {
    this.write("warn", String(msg), typeof fields === "object" ? fields : { context: fields });
  }
  error(msg: unknown, fields?: Record<string, unknown> | string) {
    const err = msg instanceof Error ? msg : undefined;
    this.write("error", err ? err.message : String(msg), {
      ...(typeof fields === "object" ? fields : fields ? { context: fields } : {}),
      ...(err?.stack ? { stack: err.stack } : {}),
    });
  }

  // LoggerService של Nest: log/verbose
  log(msg: unknown, context?: string) {
    this.write("info", String(msg), context ? { context } : {});
  }
  verbose(msg: unknown, context?: string) {
    this.write("debug", String(msg), context ? { context } : {});
  }
}
