// P12-E10
export interface Logger {
  info(msg: string): void;
  error(msg: string): void;
}

export class MemoryLogger implements Logger {
  #lines: string[] = [];
  info(msg: string): void {
    this.#lines.push(`INFO: ${msg}`);
  }
  error(msg: string): void {
    this.#lines.push(`ERROR: ${msg}`);
  }
  get lines(): string[] {
    return [...this.#lines];
  }
}

export class PrefixLogger implements Logger {
  #inner: Logger;
  #prefix: string;
  constructor(inner: Logger, prefix: string) {
    this.#inner = inner;
    this.#prefix = prefix;
  }
  info(msg: string): void {
    this.#inner.info(`${this.#prefix} ${msg}`);
  }
  error(msg: string): void {
    this.#inner.error(`${this.#prefix} ${msg}`);
  }
}

export function processOrders(ids: number[], logger: Logger): number {
  let ok = 0;
  for (const id of ids) {
    if (id > 0) {
      logger.info(`order ${id} ok`);
      ok++;
    } else {
      logger.error(`order ${id} invalid`);
    }
  }
  return ok;
}

const mem = new MemoryLogger();
console.log(processOrders([1, -2], new PrefixLogger(mem, "[orders]")), mem.lines);
