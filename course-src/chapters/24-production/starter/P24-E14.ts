// P24-E14: מאגר של Idempotency-Key בזיכרון — עם תוקף ושעון
export interface StoredResponse {
  status: number;
  body: unknown;
}
export type Begin =
  | { kind: "new" }
  | { kind: "replay"; response: StoredResponse }
  | { kind: "mismatch" }
  | { kind: "in_progress" };

export class IdempotencyStore {
  constructor({ ttlMs = 24 * 3600_000, now = () => Date.now() }: { ttlMs?: number; now?: () => number } = {}) {
    // כתוב כאן
  }

  begin(scope: string, key: string, fingerprint: string): Begin {
    return { kind: "new" }; // כתוב כאן
  }

  complete(scope: string, key: string, response: StoredResponse) {}

  release(scope: string, key: string) {}

  sweep(): number {
    return 0;
  }

  get size() {
    return 0;
  }
}
