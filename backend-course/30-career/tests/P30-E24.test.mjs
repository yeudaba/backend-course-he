import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { checkUrls } = await load(import.meta.url, "P30-E24.ts");
const sleep = (ms, signal) => new Promise((r, j) => { const t = setTimeout(r, ms); signal?.addEventListener("abort", () => { clearTimeout(t); j(new Error("aborted")); }); });

test("תוצאות בסדר הקלט; 4xx לא מנסים שוב; 5xx ושגיאות — כן", async () => {
  const calls = {};
  const behaviour = { "/ok": [200], "/missing": [404], "/flaky": [503, 200], "/down": ["err", "err"], "/broken": [500, 500] };
  const check = async (url) => {
    const n = (calls[url] = (calls[url] ?? 0) + 1);
    const b = behaviour[url][Math.min(n, behaviour[url].length) - 1];
    if (b === "err") throw new Error("ECONNREFUSED");
    return { status: b };
  };
  const r = await checkUrls(Object.keys(behaviour), check, { retries: 1 });
  assert.deepEqual(r.results.map((x) => [x.url, x.ok, x.status ?? x.error, x.attempts]), [
    ["/ok", true, 200, 1],
    ["/missing", false, 404, 1],
    ["/flaky", true, 200, 2],
    ["/down", false, "ECONNREFUSED", 2],
    ["/broken", false, 500, 2],
  ]);
  assert.deepEqual([r.up, r.down], [2, 3]);
});
test("timeout — ומבטל את הבקשה (AbortSignal)", async () => {
  let aborted = false;
  const check = async (url, signal) => { signal.addEventListener("abort", () => (aborted = true)); await sleep(1000, signal); return { status: 200 }; };
  const t0 = Date.now();
  const r = await checkUrls(["/slow"], check, { timeoutMs: 50, retries: 0 });
  assert.ok(Date.now() - t0 < 500);
  assert.equal(r.results[0].error, "timeout");
  assert.equal(aborted, true);
});
test("לכל היותר concurrency בו־זמנית", async () => {
  let active = 0;
  let peak = 0;
  const check = async () => { active++; peak = Math.max(peak, active); await sleep(15); active--; return { status: 200 }; };
  const r = await checkUrls(Array.from({ length: 12 }, (_, i) => `/u${i}`), check, { concurrency: 3 });
  assert.equal(peak, 3);
  assert.equal(r.up, 12);
  assert.deepEqual(await checkUrls([], check), { results: [], up: 0, down: 0 });
});
