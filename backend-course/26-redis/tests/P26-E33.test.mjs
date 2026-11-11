import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P26-E33.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["TypedEmitter"])).TypedEmitter;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("on, emit לפי סדר הרישום, ופונקציית ביטול", async () => {
  const TypedEmitter = await get();
  const bus = new TypedEmitter();
  const log = [];
  const stopA = bus.on("x", (p) => log.push(`a${p}`));
  bus.on("x", (p) => log.push(`b${p}`));
  bus.on("y", (p) => log.push(`y${p}`));
  assert.equal(bus.emit("x", 1), 2, "emit מחזיר כמה מאזינים נקראו");
  assert.deepEqual(log, ["a1", "b1"]);
  assert.equal(typeof stopA, "function", "on מחזיר פונקציה שמבטלת את הרישום");
  stopA();
  assert.equal(bus.emit("x", 2), 1);
  assert.deepEqual(log, ["a1", "b1", "b2"]);
  assert.equal(bus.emit("nobody", 1), 0, "אירוע בלי מאזינים — 0, לא שגיאה");
  assert.equal(bus.listenerCount("x"), 1);
  assert.equal(bus.listenerCount("nobody"), 0);
});
test("off, ואותו מאזין פעמיים נרשם פעם אחת", async () => {
  const TypedEmitter = await get();
  const bus = new TypedEmitter();
  let n = 0;
  const fn = () => n++;
  bus.on("x", fn);
  bus.on("x", fn);
  assert.equal(bus.emit("x", null), 1, "Set — אותה פונקציה לא נרשמת פעמיים");
  bus.off("x", fn);
  bus.off("x", fn);
  bus.off("never", fn);
  assert.equal(bus.emit("x", null), 0);
  assert.equal(n, 1);
});
test("once — פעם אחת, וגם מאזין שמבטל את עצמו באמצע לא מדלג על אחרים", async () => {
  const TypedEmitter = await get();
  const bus = new TypedEmitter();
  const log = [];
  bus.once("x", (p) => log.push(`once${p}`));
  bus.on("x", (p) => log.push(`on${p}`));
  assert.equal(bus.emit("x", 1), 2);
  assert.equal(bus.emit("x", 2), 1);
  assert.deepEqual(log, ["once1", "on1", "on2"], "המאזין השני נקרא גם בפעם הראשונה — עבור על עותק של הרשימה");
  const stop = bus.once("y", () => log.push("never"));
  stop();
  assert.equal(bus.emit("y", 0), 0, "once מחזיר גם הוא פונקציית ביטול");
  assert.deepEqual(Object.keys(bus), [], `יש שדות ציבוריים (${Object.keys(bus).join(", ")}) — השתמש ב־#`);
});
test("generics: שם האירוע וה־payload נבדקים בזמן קומפילציה", () => {
  const r = typeProbe(import.meta.url, FILE, `import { TypedEmitter } from "FILE";
type Events = { "order.paid": { orderId: number }; "stock.low": { left: number } };
const bus = new TypedEmitter<Events>();
bus.on("order.paid", (e) => { const id: number = e.orderId; });
bus.emit("stock.low", { left: 2 });
const n: number = bus.emit("order.paid", { orderId: 1 });
const stop: () => void = bus.once("stock.low", (e) => e.left.toFixed());
// @ts-expect-error — אירוע שלא קיים ב־Events
bus.emit("order.cancelled", { orderId: 1 });
// @ts-expect-error — payload לא נכון לאירוע
bus.emit("order.paid", { left: 2 });
// @ts-expect-error — במאזין של stock.low אין orderId
bus.on("stock.low", (e) => e.orderId);
`);
  assert.ok(r.ok, r.message);
});
