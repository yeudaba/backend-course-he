import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E48.ts";
const get = () => exportsOf(import.meta.url, FILE, ["Notifier", "NotifyError"]);
const fakeSender = (blocked = []) => {
  const sent = [];
  return { sent, send(phone, text) { if (blocked.includes(phone)) throw new Error(`חסום: ${phone}`); sent.push([phone, text]); } };
};

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("Notifier מקבל כל Sender", () => {
  const r = typeProbe(import.meta.url, FILE, `import { Notifier } from "FILE";
import type { Sender } from "FILE";
const s: Sender = { send(phone: string, text: string) {} };
const n = new Notifier(s);
const count: number = n.notifyAll([{ name: "a" }, { name: "b", phone: "1" }], "t");
// @ts-expect-error — Sender חייב send
new Notifier({});
export { count };
`);
  assert.ok(r.ok, r.message);
});
test("שולח רק למי שיש טלפון, לפי הסדר", async () => {
  const { Notifier } = await get();
  const s = fakeSender();
  const n = new Notifier(s);
  assert.equal(n.notifyAll([{ name: "דנה", phone: "050" }, { name: "עומר" }, { name: "נועה", phone: "052" }, { name: "רון", phone: "" }], "שלום"), 2);
  assert.deepEqual(s.sent, [["050", "שלום"], ["052", "שלום"]]);
  assert.equal(n.notifyAll([], "x"), 0);
  assert.deepEqual(Object.keys(n), [], "השולח צריך להיות בשדה פרטי (#)");
});
test("כישלון ← NotifyError עם sent ו־cause, ועצירה", async () => {
  const { Notifier, NotifyError } = await get();
  const s = fakeSender(["000"]);
  const n = new Notifier(s);
  let caught;
  try {
    n.notifyAll([{ name: "א", phone: "1" }, { name: "ב" }, { name: "ג", phone: "2" }, { name: "רון", phone: "000" }, { name: "ד", phone: "3" }], "היי");
  } catch (err) {
    caught = err;
  }
  assert.ok(caught instanceof NotifyError, "צריך לזרוק NotifyError");
  assert.ok(caught instanceof Error);
  assert.equal(caught.name, "NotifyError");
  assert.equal(caught.message, "השליחה ל־רון נכשלה");
  assert.equal(caught.sent, 2);
  assert.ok(caught.cause instanceof Error && caught.cause.message === "חסום: 000", "השגיאה המקורית צריכה להיות ב־cause");
  assert.deepEqual(s.sent.map((x) => x[0]), ["1", "2"], "אחרי כישלון עוצרים");
});
