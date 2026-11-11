// P18-E27: מאחד שליפות (batch loader)
import type { Pool } from "pg";

export type Person = { id: number; full_name: string };
type Waiter = { resolve: (p: Person | null) => void; reject: (err: unknown) => void };

export function createPersonLoader(pool: Pick<Pool, "query">) {
  let waiting = new Map<number, Waiter[]>();

  async function flush() {
    const batch = waiting;
    waiting = new Map();
    try {
      const { rows } = await pool.query("SELECT id, full_name FROM people WHERE id = ANY($1)", [[...batch.keys()]]);
      const byId = new Map<number, Person>(rows.map((p: Person) => [p.id, p]));
      for (const [id, waiters] of batch) {
        for (const w of waiters) w.resolve(byId.get(id) ?? null);
      }
    } catch (err) {
      for (const waiters of batch.values()) {
        for (const w of waiters) w.reject(err);
      }
    }
  }

  return function load(id: number): Promise<Person | null> {
    return new Promise((resolve, reject) => {
      if (waiting.size === 0) setTimeout(flush, 0);
      const list = waiting.get(id) ?? [];
      list.push({ resolve, reject });
      waiting.set(id, list);
    });
  };
}
