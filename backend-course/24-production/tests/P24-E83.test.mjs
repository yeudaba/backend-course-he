import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E83.ts", ["createShutdown"])).createShutdown;

function deps({ serverMs = 0, dbFails = false, timeoutMs = 50 } = {}) {
  const events = [];
  const d = {
    setReady: (r) => events.push(`ready:${r}`),
    closeServer: () => new Promise((res) => { events.push("closeServer"); setTimeout(() => { events.push("server closed"); res(); }, serverMs); }),
    closeDb: async () => { events.push("closeDb"); if (dbFails) throw new Error("db"); },
    exit: (c) => events.push(`exit:${c}`),
    log: (m) => events.push(`log:${m}`),
    timeoutMs,
    delay: (ms) => new Promise((res) => setTimeout(res, ms)),
  };
  return { d, events };
}

test("הסדר הנכון ו־exit 0", async () => {
  const { d, events } = deps({ serverMs: 10 });
  await (await get())(d)("SIGTERM");
  assert.deepEqual(events, ["log:SIGTERM received", "ready:false", "closeServer", "server closed", "closeDb", "exit:0"]);
});
test("timeout ← ממשיכים, ו־exit 1", async () => {
  const { d, events } = deps({ serverMs: 300, timeoutMs: 20 });
  await (await get())(d)("SIGTERM");
  assert.deepEqual(events, ["log:SIGTERM received", "ready:false", "closeServer", "log:timeout", "closeDb", "exit:1"]);
});
test("המסד נכשל ← exit 1", async () => {
  const { d, events } = deps({ dbFails: true });
  await (await get())(d)("SIGINT");
  assert.deepEqual(events, ["log:SIGINT received", "ready:false", "closeServer", "server closed", "closeDb", "log:db close failed", "exit:1"]);
});
test("אות שני — אותה Promise, בלי לחזור על צעדים", async () => {
  const { d, events } = deps({ serverMs: 20 });
  const shutdown = (await get())(d);
  const a = shutdown("SIGTERM");
  const b = shutdown("SIGINT");
  assert.equal(a, b);
  await a;
  await shutdown("SIGTERM");
  assert.equal(events.filter((e) => e === "closeDb").length, 1);
  assert.equal(events.filter((e) => e.startsWith("exit")).length, 1);
  assert.equal(events.filter((e) => e.startsWith("log:SIG")).length, 1);
});
test("ברירת מחדל ל־delay", async () => {
  const { d, events } = deps({ serverMs: 5, timeoutMs: 1000 });
  delete d.delay;
  const started = Date.now();
  await (await get())(d)("SIGTERM");
  assert.equal(events.at(-1), "exit:0");
  assert.ok(Date.now() - started < 900, "לא מחכים ל־timeout כשהשרת נסגר");
});
