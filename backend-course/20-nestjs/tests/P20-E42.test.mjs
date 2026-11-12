import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E42.ts", ["Container"]).Container;
test("בונה לפי תלויות, פעם אחת", () => {
  const Container = get();
  const c = new Container();
  const made = [];
  c.register("controller", ["service", "clock"], (s, clk) => (made.push("controller"), { s, clk }));
  c.register("service", ["repo", "clock"], (r, clk) => (made.push("service"), { r, clk }));
  c.register("repo", [], () => (made.push("repo"), { rows: [] }));
  c.register("clock", [], () => (made.push("clock"), { now: () => 1 }));
  const ctrl = c.get("controller");
  assert.deepEqual(made, ["repo", "clock", "service", "controller"], "קודם התלויות, לפי הסדר");
  assert.equal(ctrl.s.r, c.get("repo"));
  assert.equal(ctrl.clk, ctrl.s.clk, "clock — אותו מופע לשניהם (singleton)");
  assert.equal(c.get("service"), ctrl.s);
  assert.equal(made.length, 4, "שום דבר לא נוצר פעמיים");
});
test("שגיאות: לא רשום, תלות חסרה, מעגל", () => {
  const Container = get();
  const c = new Container();
  assert.throws(() => c.get("nope"), { message: "Cannot resolve nope" });
  c.register("orders", ["users"], () => ({}));
  assert.throws(() => c.get("orders"), { message: "Cannot resolve orders: missing users" });
  c.register("a", ["b"], () => ({}));
  c.register("b", ["c"], () => ({}));
  c.register("c", ["a"], () => ({}));
  assert.throws(() => c.get("a"), { message: "Circular dependency: a -> b -> c -> a" });
  assert.throws(() => c.get("b"), { message: "Circular dependency: b -> c -> a -> b" });
  c.register("ok", [], () => 42);
  assert.equal(c.get("ok"), 42, "אחרי שגיאה — ה־container עדיין עובד");
});
