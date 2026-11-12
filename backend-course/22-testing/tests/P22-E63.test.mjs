import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E63.ts", ["waitFor"])).waitFor;

test("מצליח מיד", async () => {
  const waitFor = await get();
  let calls = 0;
  assert.equal(await waitFor(() => { calls++; return 42; }), 42);
  assert.equal(calls, 1);
});
test("מנסה שוב עד שמצליח", async () => {
  const waitFor = await get();
  let calls = 0;
  const t0 = Date.now();
  const v = await waitFor(() => {
    calls++;
    if (calls < 4) throw new Error(`עוד לא (${calls})`);
    return "מוכן";
  }, { intervalMs: 10 });
  assert.equal(v, "מוכן");
  assert.equal(calls, 4);
  assert.ok(Date.now() - t0 < 500);
  let n = 0;
  assert.equal(await waitFor(async () => { if (++n < 3) throw new Error("x"); return n; }, { intervalMs: 5 }), 3, "גם check אסינכרוני שנדחה");
});
test("timeout ← השגיאה האחרונה", async () => {
  const waitFor = await get();
  let calls = 0;
  const t0 = Date.now();
  await assert.rejects(waitFor(() => { calls++; assert.equal(calls * 0, 1); }, { timeoutMs: 100, intervalMs: 10 }), (e) => e.code === "ERR_ASSERTION" && /0 !== 1/.test(e.message));
  const took = Date.now() - t0;
  assert.ok(took >= 90 && took < 600, `נמשך ${took}ms — צריך בערך timeoutMs`);
  assert.ok(calls >= 3, "ניסה כמה פעמים");
  let k = 0;
  await assert.rejects(waitFor(() => { throw new Error(`ניסיון ${++k}`); }, { timeoutMs: 60, intervalMs: 10 }), (e) => e.message === `ניסיון ${k}`, "השגיאה של הניסיון האחרון, לא הראשון");
});
test("timeoutMs: 0 — עדיין ניסיון אחד", async () => {
  const waitFor = await get();
  assert.equal(await waitFor(() => "x", { timeoutMs: 0 }), "x");
  let c = 0;
  await assert.rejects(waitFor(() => { c++; throw new Error("לא"); }, { timeoutMs: 0 }), { message: "לא" });
  assert.equal(c, 1);
});
test("ברירות מחדל", async () => {
  const waitFor = await get();
  let n = 0;
  const t0 = Date.now();
  assert.equal(await waitFor(() => { if (++n < 3) throw new Error("x"); return "ok"; }), "ok");
  const took = Date.now() - t0;
  assert.ok(took >= 30 && took < 400, `שתי המתנות של 20ms (בערך) — נמשך ${took}ms`);
});
