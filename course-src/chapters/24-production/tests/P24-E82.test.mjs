import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E82.ts", ["createInflight"])).createInflight;

test("מונה, ו־end פעם אחת", async () => {
  const f = (await get())();
  assert.equal(f.count(), 0);
  const a = f.start();
  const b = f.start();
  assert.equal(f.count(), 2);
  a();
  a();
  assert.equal(f.count(), 1, "end שני לאותה בקשה — לא עושה כלום");
  b();
  assert.equal(f.count(), 0);
});
test("drained — מיד כשאין, וכשהאחרונה נגמרת", async () => {
  const f = (await get())();
  assert.equal(await f.drained(50), true, "אין בקשות ← true מיד");
  const end1 = f.start();
  const end2 = f.start();
  setTimeout(end1, 10);
  setTimeout(end2, 30);
  const started = Date.now();
  const [x, y] = await Promise.all([f.drained(1000), f.drained(1000)]);
  assert.deepEqual([x, y], [true, true], "כמה מחכים במקביל");
  const took = Date.now() - started;
  assert.ok(took >= 25 && took < 500, `חיכה לאחרונה (${took}ms)`);
});
test("timeout ← false; ואחר כך שוב true", async () => {
  const f = (await get())();
  const end = f.start();
  const started = Date.now();
  assert.equal(await f.drained(40), false);
  assert.ok(Date.now() - started >= 35);
  end();
  assert.equal(await f.drained(40), true);
});
test("drained שהסתיים לא משאיר טיימר", async () => {
  const f = (await get())();
  const end = f.start();
  const p = f.drained(300);
  await sleep(5);
  end();
  assert.equal(await p, true);
  const handles = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
  assert.equal(handles, 0, "הטיימר של ה־timeout בוטל");
});
