// P26-E83: outbox relay — מ־PostgreSQL לתור
import type pg from "pg";
import type { Queue } from "bullmq";

export async function relayOutbox(db: pg.Client, queue: Queue, limit = 100) {
  const { rows } = await db.query("SELECT id, kind, payload FROM outbox WHERE sent_at IS NULL ORDER BY id LIMIT $1", [limit]);
  for (const r of rows) {
    await queue.add(r.kind, r.payload, { jobId: `outbox-${r.id}` });
    await db.query("UPDATE outbox SET sent_at = now() WHERE id = $1", [r.id]);
  }
  return rows.length;
}
