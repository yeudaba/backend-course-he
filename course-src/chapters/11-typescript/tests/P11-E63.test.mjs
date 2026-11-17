import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E63.ts";
const get = () => exportsOf(import.meta.url, FILE, ["describe", "cost"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוס Notice: discriminated union", () => {
  const r = typeProbe(import.meta.url, FILE, `import { describe, cost } from "FILE";
import type { Notice } from "FILE";
const e: Notice = { kind: "email", to: "a@x", subject: "s" };
const m: Notice = { kind: "sms", phone: "050", text: "t" };
const p: Notice = { kind: "push", deviceId: "d", title: "t" };
// @ts-expect-error — ל־SMS חייב להיות phone
const noPhone: Notice = { kind: "sms", text: "t" };
// @ts-expect-error — לאימייל אין phone
const mixed: Notice = { kind: "email", to: "a", subject: "s", phone: "050" };
// @ts-expect-error — "fax" אינו סוג
const fax: Notice = { kind: "fax", number: "1" };
function onlySms(n: Notice): string {
  // @ts-expect-error — בלי בדיקת kind אין phone
  const ph = n.phone;
  if (n.kind === "sms") return n.phone;
  return ph;
}
const s: string = describe(e);
const c: number = cost(m);
export { p, noPhone, mixed, fax, onlySms, s, c };
`);
  assert.ok(r.ok, r.message);
});
test("describe", async () => {
  const { describe } = await get();
  assert.equal(describe({ kind: "email", to: "dana@x.com", subject: "שלום" }), "אימייל ל־dana@x.com: שלום");
  assert.equal(describe({ kind: "sms", phone: "050-1", text: "קוד: 1234" }), "SMS ל־050-1: קוד: 1234");
  assert.equal(describe({ kind: "push", deviceId: "dev-9", title: "חדש" }), "push ל־dev-9: חדש");
});
test("cost", async () => {
  const { cost } = await get();
  assert.equal(cost({ kind: "email", to: "a", subject: "s" }), 0);
  assert.equal(cost({ kind: "push", deviceId: "d", title: "t" }), 0);
  const sms = (len) => cost({ kind: "sms", phone: "1", text: "x".repeat(len) });
  assert.equal(sms(0), 0.05, "SMS ריק — עדיין הודעה אחת");
  assert.equal(sms(70), 0.05);
  assert.equal(sms(71), 0.1, "71 תווים = שתי הודעות");
  assert.equal(sms(150), 0.15);
  assert.equal(sms(700), 0.5);
});
test("never בשתי הפונקציות", () => {
  assert.match(code(import.meta.url, FILE), /never/, "התרגיל מבקש default עם never");
});
