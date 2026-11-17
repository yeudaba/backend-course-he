import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { perKeySerial } = await load(import.meta.url, "P26.5-E90.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("סדר בתוך key, מקביליות בין keys", async () => {
  const log = [];
  let active = 0, max = 0;
  const q = perKeySerial(async (m) => {
    active++; max = Math.max(max, active);
    log.push(`start ${m.key}${m.n}`);
    await sleep(m.ms);
    log.push(`end ${m.key}${m.n}`);
    active--;
  });
  const start = Date.now();
  q.push({ key: "a", n: 1, ms: 80 });
  q.push({ key: "a", n: 2, ms: 10 });
  q.push({ key: "b", n: 1, ms: 20 });
  q.push({ key: "a", n: 3, ms: 10 });
  await q.idle();
  const took = Date.now() - start;
  const a = log.filter((x) => x.endsWith("a1") || x.endsWith("a2") || x.endsWith("a3"));
  assert.deepEqual(a, ["start a1", "end a1", "start a2", "end a2", "start a3", "end a3"]);
  assert.ok(log.indexOf("end b1") < log.indexOf("end a1"), "b לא מחכה ל־a");
  assert.equal(max, 2);
  assert.ok(took < 180, `${took}ms — keys שונים במקביל`);
});
test("כישלון לא עוצר את הבאות; push מחזיר את התוצאה; idle", async () => {
  const done = [];
  const q = perKeySerial(async (m) => { await sleep(5); if (m.n === 1) throw new Error("bad"); done.push(m.n); });
  const p1 = q.push({ key: "x", n: 1 });
  const p2 = q.push({ key: "x", n: 2 });
  await assert.rejects(p1, { message: "bad" });
  await p2;
  assert.deepEqual(done, [2]);
  await q.idle();
  await q.idle();
});
