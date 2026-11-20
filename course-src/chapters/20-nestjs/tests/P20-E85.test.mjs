import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const { NotesModule, configureApp } = exportsOf(import.meta.url, "P20-E85.ts", ["NotesModule", "configureApp", "ApiErrorFilter"]);
const start = (t) => nestApp(t, NotesModule, { setup: (app) => configureApp(app) });

test("יצירה וקריאה תחת /api", async (t) => {
  const { call } = await start(t);
  const r = await call("POST", "/api/notes", { text: "hello" });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { id: 1, text: "hello" });
  assert.equal((await call("GET", "/notes/1")).status, 404, "בלי prefix — לא קיים");
});
test("שדה מיותר ← 400", async (t) => {
  const { call } = await start(t);
  const r = await call("POST", "/api/notes", { text: "hi", extra: 1 });
  assert.equal(r.status, 400, "שדה שלא ב־DTO צריך להיכשל — forbidNonWhitelisted");
  assert.deepEqual(r.body, { error: { code: "BAD_REQUEST", message: "Validation failed", details: ["property extra should not exist"] } });
});
test("ולידציה בצורה שלנו", async (t) => {
  const { call } = await start(t);
  const r = await call("POST", "/api/notes", { text: "" });
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: { code: "BAD_REQUEST", message: "Validation failed", details: ["text must be longer than or equal to 1 characters"] } }, "ה־filter צריך לתפוס כל HttpException, לא רק NotFoundException");
  const notInt = await call("GET", "/api/notes/abc");
  assert.equal(notInt.status, 400);
  assert.deepEqual(notInt.body, { error: { code: "BAD_REQUEST", message: "Validation failed (numeric string is expected)" } });
});
test("404 עם status 404", async (t) => {
  const { call } = await start(t);
  const r = await call("GET", "/api/notes/9");
  assert.equal(r.status, 404, "ה־filter צריך לשלוח גם את ה־status, לא רק את הגוף");
  assert.deepEqual(r.body, { error: { code: "NOT_FOUND", message: "פתק 9 לא נמצא" } });
});
