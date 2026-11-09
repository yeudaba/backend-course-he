import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { load } from "../../tools/load.mjs";

const { startLagMonitor } = await load(import.meta.url, "P28.5-E14.ts");
const block = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end);
};

test("חסימה של 250ms ← onLag עם max בסביבה", async () => {
  const reports = [];
  const stop = startLagMonitor({ thresholdMs: 100, intervalMs: 400, onLag: (r) => reports.push(r) });
  await sleep(50);
  block(250);
  await sleep(900);
  stop();
  assert.equal(reports.length, 1, `ציפינו לדיווח אחד, היו ${reports.length}`);
  assert.ok(reports[0].maxMs >= 200 && reports[0].maxMs < 600, `maxMs ${reports[0].maxMs}`);
  assert.ok(typeof reports[0].p99Ms === "number");
});
test("בלי חסימה ← שקט", async () => {
  const reports = [];
  const stop = startLagMonitor({ thresholdMs: 100, intervalMs: 200, onLag: (r) => reports.push(r) });
  await sleep(700);
  stop();
  assert.deepEqual(reports, []);
});
test("stop עוצר, והמוניטור לא מחזיק את התהליך חי", async () => {
  const reports = [];
  const stop = startLagMonitor({ thresholdMs: 1, intervalMs: 50, onLag: (r) => reports.push(r) });
  stop();
  block(120);
  await sleep(200);
  assert.deepEqual(reports, []);
});
