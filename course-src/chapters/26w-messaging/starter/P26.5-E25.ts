// P26.5-E25: אנליטיקה מ־Kafka ל־PostgreSQL — ה־offset נשמר באותה טרנזקציה עם התוצאה
import { Admin, Consumer, MessagesStreamModes, stringDeserializers } from "@platformatic/kafka";
import type { Pool } from "pg";

export interface AggregatorOptions {
  brokers: string[];
  topic: string;
  pool: Pool;
  max: number;
}

export async function runRevenueAggregator({ brokers, topic, pool, max }: AggregatorOptions): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}
