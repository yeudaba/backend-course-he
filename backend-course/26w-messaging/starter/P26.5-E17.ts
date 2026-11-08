// P26.5-E17: transactional outbox — ההזמנה והאירוע נשמרים יחד; relay שולח אחר כך
import type { Pool } from "pg";

export interface OutboxRow {
  id: number;
  topic: string;
  key: string;
  payload: any;
}

export async function placeOrder(pool: Pool, order: { email: string; totalCents: number }): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function relayOutbox(pool: Pool, publish: (row: OutboxRow) => Promise<void>, { batch = 100 } = {}): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}
