// P24-E10: הקשר של בקשה עם AsyncLocalStorage
import { AsyncLocalStorage } from "node:async_hooks";

export interface Context {
  requestId: string;
  userId?: number;
}

export function runWithContext<T>(context: Context, fn: () => T): T {
  return fn(); // כתוב כאן
}

export function getContext(): Context | undefined {
  return undefined; // כתוב כאן
}

export function setUser(userId: number) {
  // כתוב כאן
}

export function logLine(msg: string, fields: Record<string, unknown> = {}): string {
  return JSON.stringify({ msg, ...fields }); // כתוב כאן
}
