// P29-E16: createCachedAsk — cache לתשובות שחוזרות
import { createHash } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

export function createCachedAsk(client: Anthropic, kv: KV, options: { model: string; system: string; ttlSeconds?: number }): { ask(question: string): Promise<string>; stats: { hits: number; misses: number } } {
  throw new Error("עוד לא כתבת את הפתרון");
}
