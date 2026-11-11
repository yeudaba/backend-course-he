import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E54.mjs", ["resolveSettings"])).resolveSettings;

test("סדר עדיפויות: דגל ← סביבה ← ברירת מחדל", async () => {
  const r = await get();
  assert.deepEqual(r(["shop", "--port", "9000"], { PORT: "8080" }), { port: 9000, verbose: false, name: "shop" });
  assert.deepEqual(r(["--port=7000"], { PORT: "8080" }), { port: 7000, verbose: false, name: "app" });
  assert.deepEqual(r([], { PORT: "8080", VERBOSE: "1" }), { port: 8080, verbose: true, name: "app" });
  assert.deepEqual(r([], {}), { port: 3000, verbose: false, name: "app" });
  assert.deepEqual(r(["--verbose", "a", "b"], { VERBOSE: "0" }), { port: 3000, verbose: true, name: "a" });
});
test("הערך של --port אינו name", async () => {
  const r = await get();
  assert.deepEqual(r(["--port", "9000", "api"], {}), { port: 9000, verbose: false, name: "api" });
});
test("פורט לא תקין — עם הטקסט המקורי", async () => {
  const r = await get();
  assert.throws(() => r(["--port", "abc"], {}), { message: "port לא תקין: abc" });
  assert.throws(() => r([], { PORT: "70000" }), { message: "port לא תקין: 70000" });
  assert.throws(() => r(["--port=0"], {}), { message: "port לא תקין: 0" });
  assert.throws(() => r(["--port="], { PORT: "8080" }), { message: "port לא תקין: " }, "--port= ריק — לא נופלים בשקט לערך הסביבה");
  assert.throws(() => r([], { PORT: "80.5" }), { message: "port לא תקין: 80.5" });
  assert.deepEqual(r(["--port", "abc", "--port", "5000"], {}).port, 5000, "הדגל האחרון קובע");
});
test("דגל לא מוכר", async () => {
  const r = await get();
  assert.throws(() => r(["--prot", "1"], {}), { message: "דגל לא מוכר: --prot" });
  assert.throws(() => r(["x", "--verbose=yes"], {}), { message: "דגל לא מוכר: --verbose=yes" });
});
