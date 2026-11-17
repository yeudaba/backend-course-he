import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E67.ts";
const get = () => exportsOf(import.meta.url, FILE, ["balance", "feeReasons"]);
const dep = (amount) => ({ type: "deposit", amount });
const wd = (amount) => ({ type: "withdraw", amount });
const fee = (amount, reason) => ({ type: "fee", amount, reason });
const freeze = { type: "freeze" };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוס AccountEvent", () => {
  const r = typeProbe(import.meta.url, FILE, `import { balance, feeReasons } from "FILE";
import type { AccountEvent } from "FILE";
const ok: AccountEvent[] = [{ type: "deposit", amount: 1 }, { type: "fee", amount: 1, reason: "r" }, { type: "freeze" }];
// @ts-expect-error — לעמלה חייבת להיות סיבה
const noReason: AccountEvent = { type: "fee", amount: 1 };
// @ts-expect-error — ל־freeze אין סכום
const frozenAmount: AccountEvent = { type: "freeze", amount: 5 };
// @ts-expect-error — "refund" אינו סוג אירוע
const refund: AccountEvent = { type: "refund", amount: 5 };
const b: number = balance(ok);
const r: string[] = feeReasons(ok);
export { noReason, frozenAmount, refund, b, r };
`);
  assert.ok(r.ok, r.message);
});
test("balance", async () => {
  const { balance } = await get();
  assert.equal(balance([dep(100), fee(5, "ניהול"), wd(30)]), 65);
  assert.equal(balance([]), 0);
  assert.equal(balance([dep(100), fee(5, "x"), wd(30), freeze, dep(1000), wd(1)]), 65, "אחרי freeze מתעלמים מהכול");
  assert.equal(balance([freeze, dep(50)]), 0);
  assert.equal(balance([wd(20), dep(5)]), -15);
});
test("feeReasons — לפי הסדר, כולל אחרי freeze", async () => {
  const { feeReasons } = await get();
  assert.deepEqual(feeReasons([dep(1), fee(1, "א"), freeze, fee(2, "ב"), wd(1)]), ["א", "ב"]);
  assert.deepEqual(feeReasons([dep(1)]), []);
});
