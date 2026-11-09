import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { setTimeout as sleep } from "node:timers/promises";
import { load } from "../../tools/load.mjs";

const { createServer } = await load(import.meta.url, "P28.5-E23.ts");

async function start(t) {
  const s = createServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => s.close(r)));
  return `http://127.0.0.1:${s.address().port}`;
}
// שולחים עבודה כבדה, ובמקביל מודדים כמה זמן לוקח ל־/health לענות
async function healthDuring(base, path, n) {
  const heavy = Promise.all(Array.from({ length: n }, () => fetch(base + path).then((r) => r.arrayBuffer())));
  let worst = 0;
  let done = false;
  heavy.finally(() => (done = true));
  await sleep(10);
  while (!done) {
    const t0 = performance.now();
    await (await fetch(base + "/health")).text();
    worst = Math.max(worst, performance.now() - t0);
    await sleep(10);
  }
  await heavy;
  return Math.round(worst);
}

test("באג 1: /login לא חוסם את השרת", async (t) => {
  const base = await start(t);
  const worst = await healthDuring(base, "/login", 6);
  assert.ok(worst < 120, `/health חיכה ${worst}ms בזמן 6 התחברויות — pbkdf2Sync חוסם`);
});
test("באג 2: /export לא חוסם את השרת", async (t) => {
  const base = await start(t);
  const res = await fetch(base + "/export");
  assert.equal(res.headers.get("content-encoding"), "gzip");
  assert.equal((await res.json()).length, 200000, "התוכן לא השתנה");
  const worst = await healthDuring(base, "/export", 4);
  assert.ok(worst < 120, `/health חיכה ${worst}ms בזמן ייצוא — gzipSync חוסם`);
});
test("באג 3: /slow מחכה בלי לחסום", async (t) => {
  const base = await start(t);
  const t0 = performance.now();
  const worst = await healthDuring(base, "/slow", 3);
  assert.ok(performance.now() - t0 >= 290, "/slow עדיין לוקח ~300ms");
  assert.ok(worst < 120, `/health חיכה ${worst}ms — לולאת המתנה עסוקה`);
});
