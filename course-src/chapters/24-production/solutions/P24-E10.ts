// P24-E10
import { AsyncLocalStorage } from "node:async_hooks";

export interface Context {
  requestId: string;
  userId?: number;
}

const storage = new AsyncLocalStorage<Context>();

// כל מה שרץ בתוך fn — גם אחרי await ו־setTimeout — רואה את אותו context
export function runWithContext<T>(context: Context, fn: () => T): T {
  return storage.run({ ...context }, fn);
}

export function getContext(): Context | undefined {
  return storage.getStore();
}

export function setUser(userId: number) {
  const ctx = storage.getStore();
  if (!ctx) throw new Error("אין הקשר של בקשה");
  ctx.userId = userId; // משנים את האובייקט עצמו — מי שבהמשך הבקשה יקרא, יראה
}

export function logLine(msg: string, fields: Record<string, unknown> = {}): string {
  return JSON.stringify({ msg, ...getContext(), ...fields });
}
