import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P25-E08.ts");
const pkg = { name: "orders-api", version: "2.3.1" };
async function start(t, env) {
  const clock = { t: Date.parse("2026-11-08T10:00:00Z") };
  const { base, close } = await listen(createApp({ env, now: () => new Date(clock.t), pkg }));
  t.after(close);
  return { call: api(base), clock };
}

test("commit מ־GIT_COMMIT", async (t) => {
  const sha = "2cb197caebad857cf5eed6c8d1ddd582085d5dca";
  const { call, clock } = await start(t, { GIT_COMMIT: sha });
  clock.t += 125_900;
  const r = await call("GET", "/version");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { name: "orders-api", version: "2.3.1", commit: sha, shortCommit: "2cb197c", startedAt: "2026-11-08T10:00:00.000Z", uptimeSeconds: 125 });
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("RENDER_GIT_COMMIT, ובלי כלום — dev", async (t) => {
  assert.equal((await (await start(t, { RENDER_GIT_COMMIT: "abcdef0123" })).call("GET", "/version")).body.commit, "abcdef0123");
  const r = await (await start(t, {})).call("GET", "/version");
  assert.equal(r.body.commit, "dev");
  assert.equal(r.body.shortCommit, "dev");
});
test("GIT_COMMIT קודם ל־RENDER_GIT_COMMIT", async (t) => {
  assert.equal((await (await start(t, { GIT_COMMIT: "aaa", RENDER_GIT_COMMIT: "bbb" })).call("GET", "/version")).body.commit, "aaa");
});
