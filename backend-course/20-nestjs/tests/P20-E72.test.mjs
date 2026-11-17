import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("configureApp: prefix, ולידציה ושגיאות", async (t) => {
  const { NotesModule, configureApp } = exportsOf(import.meta.url, "P20-E72.ts", ["NotesModule", "configureApp", "ApiErrorFilter", "CreateNoteDto"]);
  const { call } = await nestApp(t, NotesModule, { setup: (app) => configureApp(app) });
  const r = await call("POST", "/api/notes", { text: "hello" });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { id: 1, text: "hello" });
  assert.deepEqual((await call("GET", "/api/notes/1")).body, { id: 1, text: "hello" });
  const nf = await call("GET", "/api/notes/9");
  assert.equal(nf.status, 404);
  assert.deepEqual(nf.body, { error: { code: "NOT_FOUND", message: "פתק 9 לא נמצא" } });
  const noPrefix = await call("GET", "/notes/1");
  assert.equal(noPrefix.status, 404, "בלי prefix — לא קיים");
  const bad = await call("POST", "/api/notes", { text: "", extra: 1 });
  assert.equal(bad.status, 400);
  assert.equal(bad.body?.error?.code, "BAD_REQUEST");
  assert.equal(bad.body?.error?.message, "Validation failed");
  assert.deepEqual([...bad.body.error.details].sort(), ["property extra should not exist", "text must be longer than or equal to 1 characters"]);
  const notInt = await call("GET", "/api/notes/abc");
  assert.equal(notInt.status, 400);
  assert.deepEqual(notInt.body, { error: { code: "BAD_REQUEST", message: "Validation failed (numeric string is expected)" } });
});
