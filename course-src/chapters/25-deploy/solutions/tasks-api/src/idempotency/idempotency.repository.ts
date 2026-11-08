// מה ה־repository עונה כשמגיעה בקשה עם Idempotency-Key
export type Reservation =
  | { kind: "new" } // מפתח חדש — שמרנו אותו "בטיפול", ואפשר לבצע
  | { kind: "replay"; status: number; body: unknown } // כבר בוצע — מחזירים את אותה תשובה
  | { kind: "mismatch" } // אותו מפתח, בקשה אחרת
  | { kind: "in_progress" }; // הבקשה הראשונה עוד רצה

export const IDEMPOTENCY_REPOSITORY = "IDEMPOTENCY_REPOSITORY";

export interface IdempotencyRepository {
  // אטומי: רק בקשה אחת מקבלת "new" לאותו (userId, key)
  reserve(userId: number, key: string, fingerprint: string, now: Date, ttlHours: number): Promise<Reservation>;
  complete(userId: number, key: string, status: number, body: unknown): Promise<void>;
  release(userId: number, key: string): Promise<void>;
}

interface Row {
  fingerprint: string;
  status: number | null;
  body: unknown;
  createdAt: number;
}

export class InMemoryIdempotencyRepository implements IdempotencyRepository {
  #rows = new Map<string, Row>();

  async reserve(userId: number, key: string, fingerprint: string, now: Date, ttlHours: number): Promise<Reservation> {
    const id = `${userId}:${key}`;
    const row = this.#rows.get(id);
    if (row && row.createdAt > now.getTime() - ttlHours * 3_600_000) {
      if (row.fingerprint !== fingerprint) return { kind: "mismatch" };
      if (row.status === null) return { kind: "in_progress" };
      return { kind: "replay", status: row.status, body: row.body };
    }
    this.#rows.set(id, { fingerprint, status: null, body: null, createdAt: now.getTime() });
    return { kind: "new" };
  }

  async complete(userId: number, key: string, status: number, body: unknown) {
    const row = this.#rows.get(`${userId}:${key}`);
    if (row) Object.assign(row, { status, body });
  }

  async release(userId: number, key: string) {
    this.#rows.delete(`${userId}:${key}`);
  }
}
