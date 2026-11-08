// P26-E12: מנעול מבוזר ב־Redis
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

export async function acquire(redis: Redis, name: string, ttlMs: number): Promise<string | null> {
  return null; // כתוב כאן
}

export async function release(redis: Redis, name: string, token: string): Promise<boolean> {
  return false; // כתוב כאן
}

export async function withLock<T>(redis: Redis, name: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  return fn(); // כתוב כאן
}
