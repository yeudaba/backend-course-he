// P24-E14
export interface StoredResponse {
  status: number;
  body: unknown;
}
export type Begin =
  | { kind: "new" }
  | { kind: "replay"; response: StoredResponse }
  | { kind: "mismatch" }
  | { kind: "in_progress" };

interface Entry {
  fingerprint: string;
  response: StoredResponse | null; // null = עדיין בטיפול
  createdAt: number;
}

export class IdempotencyStore {
  #entries = new Map<string, Entry>();
  #ttlMs: number;
  #now: () => number;

  constructor({ ttlMs = 24 * 3600_000, now = () => Date.now() }: { ttlMs?: number; now?: () => number } = {}) {
    this.#ttlMs = ttlMs;
    this.#now = now;
  }

  // scope = מי (בדרך כלל userId). אותו key של שני משתמשים — שתי רשומות נפרדות
  #id(scope: string, key: string) {
    return JSON.stringify([scope, key]); // לא `${scope}:${key}` — "a:b"+"c" ו־"a"+"b:c" היו מתנגשים
  }

  #live(id: string): Entry | undefined {
    const e = this.#entries.get(id);
    if (e && this.#now() - e.createdAt >= this.#ttlMs) {
      this.#entries.delete(id);
      return undefined;
    }
    return e;
  }

  begin(scope: string, key: string, fingerprint: string): Begin {
    const id = this.#id(scope, key);
    const e = this.#live(id);
    if (!e) {
      this.#entries.set(id, { fingerprint, response: null, createdAt: this.#now() });
      return { kind: "new" };
    }
    if (e.fingerprint !== fingerprint) return { kind: "mismatch" };
    if (e.response === null) return { kind: "in_progress" };
    return { kind: "replay", response: e.response };
  }

  complete(scope: string, key: string, response: StoredResponse) {
    const e = this.#entries.get(this.#id(scope, key));
    if (!e) throw new Error("אין בקשה כזו בטיפול");
    e.response = response;
  }

  release(scope: string, key: string) {
    const id = this.#id(scope, key);
    if (this.#entries.get(id)?.response === null) this.#entries.delete(id); // רק מה שלא הושלם
  }

  // מוחק רשומות שפג תוקפן; מחזיר כמה נמחקו. בשרת — כל כמה דקות
  sweep(): number {
    let removed = 0;
    for (const id of [...this.#entries.keys()]) if (!this.#live(id)) removed++;
    return removed;
  }

  get size() {
    return this.#entries.size;
  }
}
