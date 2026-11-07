import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { NotesModule } = loadNest(import.meta.url, "P21-E22.ts");
const dana = { headers: { "x-user-id": "1" } };
const yossi = { headers: { "x-user-id": "2" } };

test("DELETE בודק בעלות", async (t) => {
  const { call } = await nestApp(t, NotesModule, { validation: true });
  assert.equal((await call("DELETE", "/notes/1", undefined, yossi)).status, 404);
  assert.equal((await call("GET", "/notes", undefined, dana)).body.length, 1, "הפתק של דנה עדיין קיים");
});
test("הרשימה לפי הטוקן, לא לפי query", async (t) => {
  const { call } = await nestApp(t, NotesModule, { validation: true });
  const res = await call("GET", "/notes?ownerId=1", undefined, yossi);
  assert.deepEqual(res.body.map((n) => n.id), [2], "?ownerId מתעלמים — יוסי רואה רק את שלו");
});
test("אי אפשר להעביר פתק למשתמש אחר", async (t) => {
  const { call } = await nestApp(t, NotesModule, { validation: true });
  const res = await call("PATCH", "/notes/2", { ownerId: 1 }, yossi);
  assert.equal(res.status, 400, "ownerId לא חלק מה־DTO");
  assert.deepEqual((await call("GET", "/notes", undefined, yossi)).body.map((n) => n.id), [2]);
  assert.equal((await call("PATCH", "/notes/2", { text: "עודכן" }, yossi)).body.text, "עודכן");
});
