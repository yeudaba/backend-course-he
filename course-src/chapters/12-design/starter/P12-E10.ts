// P12-E10
export interface Logger {
  info(msg: string): void;
  error(msg: string): void;
}

// שומר "INFO: ..." / "ERROR: ..." | get lines → עותק
export class MemoryLogger implements Logger {
  // כתוב כאן
}

// עוטף Logger אחר ומוסיף קידומת: info("x") → inner.info("[orders] x")
export class PrefixLogger implements Logger {
  // כתוב כאן
}

// id > 0 → info(`order ${id} ok`) | אחרת → error(`order ${id} invalid`). מחזירה מספר ההצלחות
export function processOrders(ids: number[], logger: Logger): number {
  // כתוב כאן
}
