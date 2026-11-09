// בדיקה מקצה לקצה: HTTP ← Kafka ← MySQL ← lake ← query API.
// צריך MySQL ו־Kafka (docker compose up), ו־MYSQL_URL (בלי database) ו־KAFKA_BROKERS ב־env.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import { Admin, Producer, stringSerializers } from "@platformatic/kafka";
import { DuckDBInstance } from "@duckdb/node-api";
import { createIngestServer } from "../src/ingest.ts";
import { runProcessor } from "../src/processor.ts";
import { exportToLake } from "../src/export.ts";
import { createQueryServer } from "../src/query.ts";

const MYSQL = process.env.MYSQL_URL ?? "mysql://root@localhost:3306";
const BROKERS = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");

test("אירועים עוברים את כל הדרך", async (t) => {
  const id = `e2e_${Date.now()}`;
  const admin = await mysql.createConnection({ uri: MYSQL, multipleStatements: true });
  await admin.query(`CREATE DATABASE ${id}`);
  const pool = mysql.createPool({ uri: MYSQL, database: id, dateStrings: true, multipleStatements: true });
  await pool.query(fs.readFileSync(new URL("../migrations/001_init.sql", import.meta.url), "utf8"));
  const kAdmin = new Admin({ clientId: "e2e", bootstrapBrokers: BROKERS });
  await kAdmin.createTopics({ topics: [id], partitions: 3, replicas: 1 });
  const producer = new Producer({ clientId: "e2e", bootstrapBrokers: BROKERS, serializers: stringSerializers, idempotent: true });
  const lakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-lake-"));
  t.after(async () => {
    await producer.close();
    await kAdmin.deleteTopics({ topics: [id] }).catch(() => {});
    await kAdmin.close();
    await pool.end();
    await admin.query(`DROP DATABASE ${id}`);
    await admin.end();
    fs.rmSync(lakeDir, { recursive: true, force: true });
  });

  const apiKeys = { "e2e-key-0123456789ab": "acme" };
  const ingest = createIngestServer({ producer, topic: id, apiKeys });
  await new Promise<void>((r) => ingest.listen(0, r));
  t.after(() => new Promise<void>((r) => ingest.close(() => r())));
  const base = `http://localhost:${(ingest.address() as any).port}`;
  const ts = new Date(Date.now() - 3600_000).toISOString();
  const events = ["page_view", "add_to_cart", "purchase"].flatMap((name, i) => Array.from({ length: 3 - i }, (_, u) => ({ eventId: randomUUID(), name, userId: `u${u}`, ts })));
  const res = await fetch(`${base}/v1/events`, { method: "POST", headers: { "content-type": "application/json", "x-api-key": "e2e-key-0123456789ab" }, body: JSON.stringify({ events }) });
  assert.equal(res.status, 202);

  const s = await runProcessor({ brokers: BROKERS, topic: id, groupId: `${id}-g`, pool, max: events.length });
  assert.equal(s.inserted, 6);
  const duck = await DuckDBInstance.create(":memory:");
  const conn = await duck.connect();
  assert.equal((await exportToLake({ pool, conn, lakeDir })).exported, 6);
  conn.closeSync();

  const query = await createQueryServer({ pool, lakeDir, apiKeys });
  await new Promise<void>((r) => query.listen(0, r));
  t.after(() => new Promise<void>((r) => query.close(() => r())));
  const qb = `http://localhost:${(query.address() as any).port}`;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date(ts));
  const daily = await (await fetch(`${qb}/v1/stats/daily?from=${day}&to=${day}`, { headers: { "x-api-key": "e2e-key-0123456789ab" } })).json();
  assert.deepEqual(daily.days, [{ day, events: 6, users: 3 }]);
  const funnel = await (await fetch(`${qb}/v1/funnel?steps=page_view,add_to_cart&from=${day}&to=${day}`, { headers: { "x-api-key": "e2e-key-0123456789ab" } })).json();
  assert.deepEqual(funnel.steps, [{ name: "page_view", users: 3 }, { name: "add_to_cart", users: 0 }], "אותו ts בדיוק — 'אחרי' הוא מחמיר");
});
