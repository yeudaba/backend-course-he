import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E39.ts", ["serializeError", "errorLine"]);

test("Error ← name, message, stack", async () => {
  const { serializeError } = await get();
  const e = new TypeError("x is not a function");
  assert.deepEqual(serializeError(e), { name: "TypeError", message: "x is not a function", stack: e.stack });
  const plain = new Error("boom");
  assert.deepEqual(Object.keys(serializeError(plain)).sort(), ["message", "name", "stack"], "בלי code ובלי cause כשאין");
});
test("code ו־cause", async () => {
  const { serializeError } = await get();
  const inner = Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" });
  const outer = new Error("save failed", { cause: inner });
  const s = serializeError(outer);
  assert.equal(s.message, "save failed");
  assert.deepEqual(s.cause, { name: "Error", message: "connect ECONNREFUSED", stack: inner.stack, code: "ECONNREFUSED" });
  assert.equal(serializeError(Object.assign(new Error("x"), { code: 23505 })).code, 23505, "code מספרי");
  assert.equal("code" in serializeError(Object.assign(new Error("x"), { code: { a: 1 } })), false, "code שאינו מחרוזת או מספר — לא מוסיפים");
  const deep = new Error("a", { cause: new Error("b", { cause: "c" }) });
  assert.deepEqual(serializeError(deep).cause.cause, { name: "NonError", message: "c" }, "cause שהוא מחרוזת");
});
test("דברים שאינם Error", async () => {
  const { serializeError } = await get();
  assert.deepEqual(serializeError("oops"), { name: "NonError", message: "oops" });
  assert.deepEqual(serializeError(42), { name: "NonError", message: "42" });
  assert.deepEqual(serializeError({ a: 1 }), { name: "NonError", message: '{"a":1}' });
  assert.deepEqual(serializeError(null), { name: "NonError", message: "null" });
  assert.deepEqual(serializeError(undefined), { name: "NonError", message: "undefined" });
});
test("errorLine — שורה אחת", async () => {
  const { errorLine } = await get();
  const err = new Error("save failed", { cause: new Error("db down") });
  const line = errorLine("db failed", err, new Date("2026-11-07T15:30:00Z"));
  assert.equal(typeof line, "string");
  assert.ok(!line.includes("\n"), "בשורה אין ירידת שורה אמיתית (ה־stack בתוך מחרוזת JSON)");
  const o = JSON.parse(line);
  assert.equal(o.time, "2026-11-07T15:30:00.000Z");
  assert.equal(o.level, "error");
  assert.equal(o.msg, "db failed");
  assert.equal(o.err.message, "save failed");
  assert.equal(o.err.cause.message, "db down");
  assert.equal(o.err.stack, err.stack);
});
