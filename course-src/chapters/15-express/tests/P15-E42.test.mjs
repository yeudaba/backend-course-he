import { test } from "node:test";
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E42.ts";
const mod = () => exportsOf(import.meta.url, FILE, ["NotesStore", "createApp"]);
async function start(t, store) {
  const { createApp } = await mod();
  const { base, close } = await listen(store ? createApp(store) : createApp());
  t.after(close);
  return api(base);
}

test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("NotesStore לבד", async () => {
  const { NotesStore } = await mod();
  const s = new NotesStore();
  const a = s.add("א");
  const b = s.add("ב");
  assert.deepEqual([a.id, a.text, b.id], [1, "א", 2]);
  assert.ok(Math.abs(Date.parse(a.createdAt) - Date.now()) < 5000, "createdAt — ISO של עכשיו");
  assert.equal(s.get(2), b);
  assert.equal(s.get(9), undefined);
  assert.deepEqual(s.list().map((n) => n.id), [1, 2]);
  assert.equal(s.remove(1), true);
  assert.equal(s.remove(1), false);
  assert.equal(s.add("ג").id, 3, "id לא חוזר על עצמו אחרי מחיקה");
  assert.deepEqual(Object.keys(s), [], "השדות פרטיים (#)");
});
test("האפליקציה עובדת עם ה־store שהועבר", async (t) => {
  const { NotesStore } = await mod();
  const store = new NotesStore();
  store.add("מוכן 1");
  store.add("מוכן 2");
  const call = await start(t, store);
  assert.deepEqual((await call("GET", "/notes")).body.map((n) => n.text), ["מוכן 1", "מוכן 2"]);
  let r = await call("POST", "/notes", { text: "  חדש  " });
  assert.equal(r.status, 201);
  assert.equal(r.headers.get("location"), "/notes/3");
  assert.equal(r.body.text, "חדש");
  assert.equal(store.get(3)?.text, "חדש", "הפתק נשמר ב־store שהועבר");
  r = await call("GET", "/notes/2");
  assert.equal(r.body.text, "מוכן 2");
  r = await call("DELETE", "/notes/1");
  assert.equal(r.status, 204);
  assert.equal(store.get(1), undefined);
  for (const [m, p] of [["GET", "/notes/1"], ["DELETE", "/notes/1"], ["GET", "/notes/abc"]]) {
    r = await call(m, p);
    assert.deepEqual([r.status, r.body], [404, { error: "לא נמצא" }], `${m} ${p}`);
  }
});
test("ברירת מחדל: store חדש לכל אפליקציה", async (t) => {
  const a = await start(t);
  const b = await start(t);
  await a("POST", "/notes", { text: "x" });
  assert.deepEqual((await b("GET", "/notes")).body, []);
});
test("text לא תקין", async (t) => {
  const call = await start(t);
  for (const body of [{}, { text: "   " }, { text: 5 }, { text: "x".repeat(201) }, undefined]) {
    const r = await call("POST", "/notes", body);
    assert.deepEqual([r.status, r.body], [400, { error: "text לא תקין" }], JSON.stringify(body));
  }
  assert.equal((await call("POST", "/notes", { text: "x".repeat(200) })).status, 201);
});
