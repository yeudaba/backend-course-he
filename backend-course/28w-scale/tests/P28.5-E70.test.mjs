import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { importNdjson } = await load(import.meta.url, "P28.5-E70.ts");
async function* from(arr) { for (const x of arr) yield x; }

test("אצוות, דילוגים ומספרי שורות", async () => {
  const calls = [];
  const db = new Set([3]);
  const insertMany = async (rows) => {
    calls.push(rows.map((r) => r.id));
    let n = 0;
    for (const r of rows) if (!db.has(r.id)) { db.add(r.id); n++; }
    return n;
  };
  const lines = ['{"id":1,"name":"a"}', "", '{"id":2,"name":"b"}', "not json", '{"id":3,"name":"c"}', '{"id":-4,"name":"d"}', '{"id":5,"name":"  "}', '{"id":6,"name":"f","extra":1}', '{"id":7,"name":"g"}'];
  const r = await importNdjson(from(lines), insertMany, 2);
  assert.deepEqual(calls, [[1, 2], [3, 6], [7]]);
  assert.equal(r.inserted, 4);
  assert.equal(r.batches, 3);
  assert.equal(r.skipped, 3);
  assert.equal(r.errors.length, 3);
  assert.match(r.errors[0], /^שורה 4:/);
  assert.match(r.errors[1], /^שורה 6:/);
  assert.match(r.errors[2], /^שורה 7:/);
});
test("ברירת מחדל 1,000, לכל היותר 10 שגיאות, ואחד בכל פעם", async () => {
  const lines = [];
  for (let i = 1; i <= 2500; i++) lines.push(JSON.stringify({ id: i, name: `n${i}` }));
  for (let i = 0; i < 15; i++) lines.push("{bad");
  let inFlight = 0, peak = 0, sizes = [];
  const r = await importNdjson(from(lines), async (rows) => {
    inFlight++; peak = Math.max(peak, inFlight); sizes.push(rows.length);
    await new Promise((res) => setTimeout(res, 5));
    inFlight--;
    return rows.length;
  });
  assert.deepEqual(sizes, [1000, 1000, 500]);
  assert.equal(peak, 1);
  assert.equal(r.inserted, 2500);
  assert.equal(r.skipped, 15);
  assert.equal(r.errors.length, 10);
});
test("ריק", async () => {
  let called = false;
  assert.deepEqual(await importNdjson(from(["", " "]), async () => { called = true; return 0; }), { inserted: 0, batches: 0, skipped: 0, errors: [] });
  assert.equal(called, false);
});
