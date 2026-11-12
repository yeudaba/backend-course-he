import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { idempotent } = await load(import.meta.url, "P26.5-E36.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("כפילות רגילה ובמקביל", async () => {
  let calls = 0;
  const h = idempotent(async () => { calls++; await sleep(30); });
  const r = await Promise.all([h({ id: "a" }), h({ id: "a" }), h({ id: "b" })]);
  assert.deepEqual(r, ["handled", "duplicate", "handled"]);
  assert.equal(calls, 2);
  assert.equal(await h({ id: "a" }), "duplicate");
  assert.equal(calls, 2);
});
test("כישלון לא מסמן", async () => {
  let n = 0;
  const h = idempotent(async () => { n++; if (n === 1) throw new Error("db down"); });
  await assert.rejects(h({ id: "x" }), { message: "db down" });
  assert.equal(await h({ id: "x" }), "handled");
  assert.equal(await h({ id: "x" }), "duplicate");
  assert.equal(n, 2);
});
test("כפילות שמחכה לראשון שנכשל — מנסה בעצמה", async () => {
  let n = 0;
  const h = idempotent(async () => { n++; await sleep(20); if (n === 1) throw new Error("boom"); });
  const [a, b] = await Promise.allSettled([h({ id: "y" }), h({ id: "y" })]);
  assert.equal(a.status, "rejected");
  assert.equal(b.value, "handled");
  assert.equal(n, 2);
});
