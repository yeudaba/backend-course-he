// P26.5-E25: אנליטיקה מ־Kafka ל־PostgreSQL — ה־offset נשמר באותה טרנזקציה עם התוצאה
import { Admin, Consumer, MessagesStreamModes, stringDeserializers } from "@platformatic/kafka";
import type { Pool } from "pg";
import { randomUUID } from "node:crypto";

export interface AggregatorOptions {
  brokers: string[];
  topic: string;
  pool: Pool;
  max: number;
}

async function partitionsOf(brokers: string[], topic: string): Promise<number[]> {
  const admin = new Admin({ clientId: "revenue-meta", bootstrapBrokers: brokers });
  try {
    const md = await admin.metadata({ topics: [topic] });
    return Array.from({ length: md.topics.get(topic)!.partitionsCount }, (_, i) => i);
  } finally {
    await admin.close();
  }
}

export async function runRevenueAggregator({ brokers, topic, pool, max }: AggregatorOptions): Promise<number> {
  const { rows } = await pool.query("SELECT partition, next_offset FROM consumer_offsets WHERE topic = $1", [topic]);
  const stored = new Map(rows.map((r: any) => [Number(r.partition), BigInt(r.next_offset)]));
  const offsets = (await partitionsOf(brokers, topic)).map((partition) => ({ topic, partition, offset: stored.get(partition) ?? 0n }));

  // group חד־פעמי לכל ריצה: ה־offsets של Kafka לא נקראים ולא נכתבים — האמת במסד
  const consumer = new Consumer({ groupId: `revenue-${topic}-${randomUUID()}`, clientId: "revenue", bootstrapBrokers: brokers, deserializers: stringDeserializers });
  const stream = await consumer.consume({ topics: [topic], mode: MessagesStreamModes.MANUAL, offsets, autocommit: false });
  let n = 0;
  try {
    for await (const m of stream) {
      const e = JSON.parse(m.value) as { orderId: number; totalCents: number; at: string };
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO revenue_by_minute (minute, orders, revenue_cents) VALUES (date_trunc('minute', $1::timestamptz), 1, $2)
           ON CONFLICT (minute) DO UPDATE SET orders = revenue_by_minute.orders + 1, revenue_cents = revenue_by_minute.revenue_cents + EXCLUDED.revenue_cents`,
          [e.at, e.totalCents],
        );
        await client.query(
          `INSERT INTO consumer_offsets (topic, partition, next_offset) VALUES ($1, $2, $3)
           ON CONFLICT (topic, partition) DO UPDATE SET next_offset = EXCLUDED.next_offset`,
          [topic, m.partition, String(m.offset + 1n)],
        );
        await client.query("COMMIT"); // התוצאה וה־offset — יחד, או אף אחד
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
      if (++n >= max) break;
    }
  } finally {
    await stream.close().catch(() => {});
    await consumer.close();
  }
  return n;
}
