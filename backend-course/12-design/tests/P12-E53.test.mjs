import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E53.ts";
const get = () => exportsOf(import.meta.url, FILE, ["TemporaryError", "retryTemporary"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("generic: הטיפוס של התוצאה", () => {
  const r = typeProbe(import.meta.url, FILE, `import { retryTemporary } from "FILE";
async function f() {
  const n: number = await retryTemporary(async () => 5, 3);
  // @ts-expect-error — התוצאה היא number
  const s: string = await retryTemporary(async () => 5, 3);
  return [n, s];
}
export { f };
`);
  assert.ok(r.ok, r.message);
});
test("TemporaryError", async () => {
  const { TemporaryError } = await get();
  const e = new TemporaryError("עמוס");
  assert.ok(e instanceof Error);
  assert.equal(e.name, "TemporaryError");
  assert.equal(e.message, "עמוס");
});
test("מנסה שוב על TemporaryError עד הצלחה", async () => {
  const { TemporaryError, retryTemporary } = await get();
  const attempts = [];
  const r = await retryTemporary(async (n) => {
    attempts.push(n);
    if (n < 3) throw new TemporaryError("עמוס");
    return "ok";
  }, 5);
  assert.equal(r, "ok");
  assert.deepEqual(attempts, [1, 2, 3]);
});
test("אחרי attempts ניסיונות — השגיאה האחרונה", async () => {
  const { TemporaryError, retryTemporary } = await get();
  let calls = 0;
  await assert.rejects(retryTemporary(async (n) => { calls++; throw new TemporaryError(`ניסיון ${n}`); }, 3), { message: "ניסיון 3" });
  assert.equal(calls, 3);
});
test("שגיאה אחרת — מיד, בלי ניסיון נוסף", async () => {
  const { TemporaryError, retryTemporary } = await get();
  let calls = 0;
  await assert.rejects(retryTemporary(async () => { calls++; throw new TypeError("סיסמה שגויה"); }, 5), TypeError);
  assert.equal(calls, 1, "על שגיאה שאינה TemporaryError לא מנסים שוב");
  calls = 0;
  await assert.rejects(retryTemporary(async (n) => { calls++; if (n === 1) throw new TemporaryError("x"); throw new Error("קבוע"); }, 5), { message: "קבוע" });
  assert.equal(calls, 2);
});
test("גם תת־מחלקה של TemporaryError", async () => {
  const { TemporaryError, retryTemporary } = await get();
  class RateLimited extends TemporaryError {}
  let calls = 0;
  assert.equal(await retryTemporary(async () => { calls++; if (calls < 2) throw new RateLimited("429"); return 7; }, 2), 7);
});
