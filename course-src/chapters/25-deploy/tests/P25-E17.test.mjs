import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { runPipeline } = await load(import.meta.url, "P25-E17.ts");
function fake({ migrateFails = false, deployFailsFor = null, smokeOk = true } = {}) {
  const calls = [];
  let running = "v1";
  return {
    calls,
    steps: {
      currentVersion: async () => running,
      migrate: async () => { calls.push("migrate"); if (migrateFails) throw new Error("P3009"); },
      deploy: async (v) => { calls.push(`deploy ${v}`); if (v === deployFailsFor) throw new Error("build failed"); running = v; },
      smoke: async (v) => { calls.push(`smoke ${v}`); return smokeOk; },
    },
  };
}

test("הכול עובר", async () => {
  const f = fake();
  const lines = [];
  assert.deepEqual(await runPipeline("v2", f.steps, (l) => lines.push(l)), { ok: true, running: "v2" });
  assert.deepEqual(f.calls, ["migrate", "deploy v2", "smoke v2"]);
  assert.ok(lines.length >= 2, "log לאורך הדרך");
});
test("migrate נכשל ← לא נוגעים בגרסה", async () => {
  const f = fake({ migrateFails: true });
  assert.deepEqual(await runPipeline("v2", f.steps), { ok: false, running: "v1" });
  assert.deepEqual(f.calls, ["migrate"]);
});
test("smoke נכשל ← rollback", async () => {
  const f = fake({ smokeOk: false });
  assert.deepEqual(await runPipeline("v2", f.steps), { ok: false, running: "v1" });
  assert.deepEqual(f.calls, ["migrate", "deploy v2", "smoke v2", "deploy v1"]);
});
test("deploy זורק ← rollback", async () => {
  const f = fake({ deployFailsFor: "v2" });
  assert.deepEqual(await runPipeline("v2", f.steps), { ok: false, running: "v1" });
  assert.deepEqual(f.calls, ["migrate", "deploy v2", "deploy v1"]);
});
