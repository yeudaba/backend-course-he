import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P26.5-E26.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["ReorderBuffer"])).ReorderBuffer;
function setup(ReorderBuffer, start) {
  const out = [];
  const b = start === undefined ? new ReorderBuffer((seq, m) => out.push(`${seq}:${m}`)) : new ReorderBuffer((seq, m) => out.push(`${seq}:${m}`), start);
  return { b, out };
}

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מוסר לפי הסדר, גם כשההודעות מגיעות מעורבבות", async () => {
  const { b, out } = setup(await get());
  assert.equal(b.push(1, "a"), "delivered");
  assert.equal(b.push(3, "c"), "buffered");
  assert.equal(b.push(4, "d"), "buffered");
  assert.deepEqual(out, ["1:a"], "3 ו־4 מחכים ל־2");
  assert.equal(b.pending, 2, "pending — כמה מחכות");
  assert.equal(b.push(2, "b"), "delivered");
  assert.deepEqual(out, ["1:a", "2:b", "3:c", "4:d"], "כש־2 מגיע — 2, 3 ו־4 נמסרים ברצף");
  assert.equal(b.pending, 0);
  assert.equal(b.nextSeq, 5);
});
test("כפילויות: שכבר נמסרה, או שכבר מחכה", async () => {
  const { b, out } = setup(await get());
  b.push(1, "a");
  assert.equal(b.push(1, "a"), "duplicate");
  b.push(3, "c");
  assert.equal(b.push(3, "c-again"), "duplicate", "3 כבר מחכה — הראשונה נשארת");
  b.push(2, "b");
  assert.deepEqual(out, ["1:a", "2:b", "3:c"]);
  assert.equal(b.push(2, "b"), "duplicate");
});
test("gaps — מה חסר בין הבא בתור לגבוה שמחכה", async () => {
  const { b } = setup(await get());
  assert.deepEqual(b.gaps(), []);
  b.push(1, "a");
  b.push(3, "c");
  b.push(6, "f");
  assert.deepEqual(b.gaps(), [2, 4, 5]);
  b.push(2, "b");
  assert.deepEqual(b.gaps(), [4, 5]);
});
test("startSeq, ו־seq לא שלם ← TypeError", async () => {
  const ReorderBuffer = await get();
  const { b, out } = setup(ReorderBuffer, 100);
  assert.equal(b.push(99, "old"), "duplicate", "לפני startSeq — כבר טופל (למשל לפני restart)");
  assert.equal(b.push(101, "x"), "buffered");
  assert.equal(b.push(100, "y"), "delivered");
  assert.deepEqual(out, ["100:y", "101:x"]);
  assert.throws(() => b.push(1.5, "z"), TypeError);
  assert.deepEqual(Object.keys(b), [], `יש שדות ציבוריים (${Object.keys(b).join(", ")}) — השתמש ב־#`);
});
test("generic: סוג ההודעה נשמר", () => {
  const r = typeProbe(import.meta.url, FILE, `import { ReorderBuffer } from "FILE";
const b = new ReorderBuffer<{ status: string }>((seq: number, m) => { const s: string = m.status; });
const r: "delivered" | "buffered" | "duplicate" = b.push(1, { status: "paid" });
const n: number = b.pending + b.nextSeq;
const g: number[] = b.gaps();
// @ts-expect-error — הודעה מסוג אחר
b.push(2, { state: "paid" });
`);
  assert.ok(r.ok, r.message);
});
