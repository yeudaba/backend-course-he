import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { idempotentTool } = await load(import.meta.url, "P29.5-E79.ts");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function memStore() {
  const m = new Map();
  const ops = [];
  return { m, ops, get: async (id) => (ops.push(["get", id]), m.has(id) ? m.get(id) : null), set: async (id, v) => (ops.push(["set", id]), m.set(id, v)) };
}

test("פעם אחת לכל id; שמור ← בלי run", async () => {
  const s = memStore();
  const calls = [];
  const send = idempotentTool(async (input) => (calls.push(input), `sent:${input.to}`), s);
  assert.equal(await send("t1", { to: "a" }), "sent:a");
  assert.equal(await send("t1", { to: "a" }), "sent:a");
  assert.equal(await send("t2", { to: "b" }), "sent:b");
  assert.deepEqual(calls, [{ to: "a" }, { to: "b" }]);
  s.m.set("t9", "");
  const other = idempotentTool(async () => assert.fail("יש תוצאה שמורה (גם ריקה)"), s);
  assert.equal(await other("t9", {}), "");
});
test("במקביל עם אותו id ← run אחד", async () => {
  const s = memStore();
  let n = 0;
  const charge = idempotentTool(async () => { n++; await wait(30); return "charged"; }, s);
  const r = await Promise.all([charge("t1", {}), charge("t1", {}), charge("t1", {}), charge("t2", {})]);
  assert.deepEqual(r, ["charged", "charged", "charged", "charged"]);
  assert.equal(n, 2);
  assert.equal(s.ops.filter(([op, id]) => op === "get" && id === "t1").length, 1, "גם ה־get רץ פעם אחת");
});
test("שגיאה ← לא נשמר, ומנסים שוב", async () => {
  const s = memStore();
  let n = 0;
  const flaky = idempotentTool(async () => { n++; if (n === 1) throw new Error("smtp down"); return "ok"; }, s);
  await assert.rejects(flaky("t1", {}), /smtp down/);
  assert.equal(s.m.has("t1"), false);
  assert.equal(await flaky("t1", {}), "ok");
  assert.equal(n, 2);
});
