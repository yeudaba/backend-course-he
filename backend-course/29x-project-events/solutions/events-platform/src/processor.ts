// ה־processor: Kafka ← MySQL. at-least-once מ־Kafka + INSERT IGNORE = כל אירוע נספר פעם אחת
import { Consumer, MessagesStreamModes, MessagesStreamFallbackModes, stringDeserializers } from "@platformatic/kafka";
import type { Pool } from "mysql2/promise";
import { israelDay, mysqlUtc } from "./time.ts";

export interface ProcessorOptions {
  brokers: string[];
  topic: string;
  groupId: string;
  pool: Pool;
  max: number; // לבדיקות ולעבודה במנות; בפרודקשן — לולאה בלי סוף
}

interface Incoming {
  tenantId: string;
  eventId: string;
  name: string;
  userId: string;
  ts: string;
  props?: Record<string, unknown>;
  receivedAt: string;
}

function parse(value: string): Incoming | null {
  try {
    const e = JSON.parse(value);
    const ok = e && [e.tenantId, e.eventId, e.name, e.userId, e.ts, e.receivedAt].every((x) => typeof x === "string" && x.length > 0) && !Number.isNaN(Date.parse(e.ts));
    return ok ? e : null;
  } catch {
    return null;
  }
}

export async function runProcessor({ brokers, topic, groupId, pool, max }: ProcessorOptions) {
  const stats = { processed: 0, inserted: 0, duplicates: 0, invalid: 0 };
  const consumer = new Consumer({ groupId, clientId: `${groupId}-processor`, bootstrapBrokers: brokers, deserializers: stringDeserializers });
  const stream = await consumer.consume({ topics: [topic], mode: MessagesStreamModes.COMMITTED, fallbackMode: MessagesStreamFallbackModes.EARLIEST, autocommit: false });
  try {
    for await (const m of stream) {
      const e = parse(m.value);
      if (!e) {
        stats.invalid++; // הודעה פגומה לא תתקן את עצמה — מדלגים (ובפרודקשן: dead letter topic)
      } else {
        const ts = new Date(e.ts);
        const day = israelDay(ts);
        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();
          const [r] = await conn.execute<any>(
            `INSERT IGNORE INTO events (tenant_id, event_id, name, user_id, ts, day, props, received_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [e.tenantId, e.eventId, e.name, e.userId, mysqlUtc(ts), day, e.props ? JSON.stringify(e.props) : null, mysqlUtc(new Date(e.receivedAt))],
          );
          if (r.affectedRows === 1) {
            // האגרגציות — באותה טרנזקציה עם האירוע: או שניהם, או אף אחד
            await conn.execute(`INSERT INTO daily_counts (tenant_id, day, name, events) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE events = events + 1`, [e.tenantId, day, e.name]);
            await conn.execute(`INSERT IGNORE INTO user_days (tenant_id, day, user_id) VALUES (?, ?, ?)`, [e.tenantId, day, e.userId]);
            stats.inserted++;
          } else stats.duplicates++;
          await conn.commit();
        } catch (err) {
          await conn.rollback().catch(() => {});
          throw err; // בלי commit ב־Kafka — ההודעה תגיע שוב
        } finally {
          conn.release();
        }
      }
      await m.commit(); // אחרי שהמסד שמר
      if (++stats.processed >= max) break;
    }
  } finally {
    await stream.close().catch(() => {});
    await consumer.close();
  }
  return stats;
}
