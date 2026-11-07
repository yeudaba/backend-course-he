// P24-E15: middleware של Idempotency-Key ל־POST
import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface StoredResponse {
  status: number;
  body: unknown;
}
export interface Store {
  begin(scope: string, key: string, fingerprint: string): { kind: "new" } | { kind: "replay"; response: StoredResponse } | { kind: "mismatch" } | { kind: "in_progress" };
  complete(scope: string, key: string, response: StoredResponse): void;
  release(scope: string, key: string): void;
}

export function idempotency({ store, scope = (req) => req.get("x-user-id") ?? "anonymous" }: { store: Store; scope?: (req: Request) => string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
}
