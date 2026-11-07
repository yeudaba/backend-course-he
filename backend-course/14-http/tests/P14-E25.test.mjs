import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { createLimitedServer } = await load(import.meta.url, "P14-E25.mjs");

test("rate limit", async (t) => {
  let clock = 1_000_000;
  const { base, close } = await listen(createLimitedServer({ limit: 3, windowMs: 10_000, now: () => clock }));
  t.after(close);
  const hit = (client) => fetch(base + "/", { headers: client ? { "X-Client-Id": client } : {}, signal: AbortSignal.timeout(1000) });

  for (const remaining of ["2", "1", "0"]) {
    const res = await hit("a");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-ratelimit-remaining"), remaining);
    assert.deepEqual(await res.json(), { ok: true });
  }
  clock += 2500;
  let res = await hit("a");
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("retry-after"), "8");
  assert.equal(res.headers.get("x-ratelimit-remaining"), "0");
  assert.deepEqual(await res.json(), { error: "יותר מדי בקשות" });

  assert.equal((await hit("b")).status, 200, "לקוח אחר — מונה משלו");
  assert.equal((await hit()).status, 200, "anonymous");

  clock += 7500;
  res = await hit("a");
  assert.equal(res.status, 200, "חלון חדש");
  assert.equal(res.headers.get("x-ratelimit-remaining"), "2");
});
