import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { NotesModule } = loadNest(import.meta.url, "P21-E14.ts");
const dana = { headers: { "x-user-id": "1" } };
const yossi = { headers: { "x-user-id": "2" } };
const admin = { headers: { "x-user-id": "9", "x-user-role": "admin" } };

test("כל אחד רואה רק את שלו", async (t) => {
  const { call } = await nestApp(t, NotesModule);
  assert.deepEqual((await call("GET", "/notes", undefined, dana)).body.map((n) => n.id), [1, 3]);
  assert.deepEqual((await call("GET", "/notes", undefined, yossi)).body.map((n) => n.id), [2]);
  assert.equal((await call("GET", "/notes/1", undefined, dana)).body.text, "הפתק של דנה");
  for (const [method, body] of [["GET"], ["PATCH", { text: "נפרץ" }], ["DELETE"]]) {
    const res = await call(method, "/notes/1", body, yossi);
    assert.equal(res.status, 404, `${method} לפתק של מישהו אחר`);
    assert.equal(res.body.message, "פתק 1 לא נמצא");
  }
  assert.equal((await call("GET", "/notes/1", undefined, dana)).body.text, "הפתק של דנה", "לא השתנה");
  assert.equal((await call("PATCH", "/notes/3", { text: "עודכן" }, dana)).body.text, "עודכן");
  assert.equal((await call("DELETE", "/notes/3", undefined, dana)).status, 204);
  assert.equal((await call("GET", "/notes/3", undefined, dana)).status, 404);
});
test("all=true רק ל־admin", async (t) => {
  const { call } = await nestApp(t, NotesModule);
  assert.equal((await call("GET", "/notes?all=true", undefined, dana)).status, 403);
  assert.equal((await call("GET", "/notes?all=true", undefined, admin)).body.length, 3);
  assert.equal((await call("GET", "/notes")).status, 401);
});
