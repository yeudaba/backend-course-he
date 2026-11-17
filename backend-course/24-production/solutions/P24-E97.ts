// P24-E97: logger של JSON בשביל Nest
type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class JsonLogger {
  #sink: (line: string) => void;
  #now: () => Date;
  #level: Level;

  constructor({ sink, now, level }: { sink: (line: string) => void; now: () => Date; level: Level }) {
    this.#sink = sink;
    this.#now = now;
    this.#level = level;
  }

  #write(level: Level, message: unknown, context?: unknown, stack?: unknown) {
    if (ORDER[level] < ORDER[this.#level]) return;
    const err = message instanceof Error ? message : undefined;
    const msg = err ? err.message : typeof message === "string" ? message : JSON.stringify(message);
    const st = typeof stack === "string" && stack ? stack : err?.stack;
    this.#sink(JSON.stringify({
      time: this.#now().toISOString(),
      level,
      msg,
      ...(typeof context === "string" && context ? { context } : {}),
      ...(st ? { stack: st } : {}),
    }));
  }

  log(message: unknown, context?: string) { this.#write("info", message, context); }
  warn(message: unknown, context?: string) { this.#write("warn", message, context); }
  debug(message: unknown, context?: string) { this.#write("debug", message, context); }
  verbose(message: unknown, context?: string) { this.#write("debug", message, context); }
  fatal(message: unknown, context?: string) { this.#write("error", message, context); }
  error(message: unknown, stack?: string, context?: string) { this.#write("error", message, context, stack); }
}
