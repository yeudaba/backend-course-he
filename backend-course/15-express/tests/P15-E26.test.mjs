import { test } from "node:test";
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P15-E26.ts";

async function start(t) {
  const { createApp } = await exportsOf(import.meta.url, FILE, ["createApp"]);
  const { base, close } = await listen(createApp());
  t.after(close);
  return api(base);
}

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("POST — 201, ‏Location, ‏trim ו־done ברירת מחדל", async (t) => {
  const call = await start(t);
  const r = await call("POST", "/tasks", { title: "  לקנות חלב " });
  assert.equal(r.status, 201);
  assert.equal(r.headers.get("location"), "/tasks/1", "header בשם Location עם הכתובת של המשימה החדשה");
  assert.deepEqual(r.body, { id: 1, title: "לקנות חלב", done: false }, "title אחרי trim, ו־done: false כברירת מחדל");
  const r2 = await call("POST", "/tasks", { title: "לשלם חשבון", done: true, id: 99 });
  assert.deepEqual(r2.body, { id: 2, title: "לשלם חשבון", done: true }, "id נקבע על ידי השרת, לא על ידי הלקוח");
});
test("POST לא תקין — 400 עם fields", async (t) => {
  const call = await start(t);
  const r = await call("POST", "/tasks", { title: "   ", done: "yes" });
  assert.equal(r.status, 400);
  assert.equal(r.body?.error, "קלט לא תקין");
  assert.deepEqual([...(r.body?.fields ?? [])].sort(), ["done", "title"], "fields: שמות השדות שנכשלו, כל שם פעם אחת");
  const long = await call("POST", "/tasks", { title: "א".repeat(101) });
  assert.equal(long.status, 400, "title ארוך מ־100 תווים");
  assert.deepEqual(long.body?.fields, ["title"]);
  const none = await call("POST", "/tasks");
  assert.equal(none.status, 400, "בקשה בלי גוף בכלל");
  const after = await call("GET", "/tasks");
  assert.deepEqual(after.body, [], "בקשה שנכשלה לא אמורה להוסיף משימה");
});
test("JSON שבור — 400", async (t) => {
  const call = await start(t);
  const r = await call("POST", "/tasks", undefined, { raw: "{ title: ", headers: { "Content-Type": "application/json" } });
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: "JSON לא תקין" });
});
test("GET — רשימה, סינון לפי done, ומשימה אחת", async (t) => {
  const call = await start(t);
  await call("POST", "/tasks", { title: "א" });
  await call("POST", "/tasks", { title: "ב", done: true });
  await call("POST", "/tasks", { title: "ג" });
  assert.equal((await call("GET", "/tasks")).body.length, 3);
  assert.deepEqual((await call("GET", "/tasks?done=true")).body.map((x) => x.title), ["ב"]);
  assert.deepEqual((await call("GET", "/tasks?done=false")).body.map((x) => x.title), ["א", "ג"], "ב־query הכול מחרוזות: done === \"false\"");
  assert.equal((await call("GET", "/tasks?done=maybe")).body.length, 3, "ערך אחר של done — כאילו לא נשלח");
  assert.deepEqual((await call("GET", "/tasks/2")).body, { id: 2, title: "ב", done: true });
  for (const id of ["9", "abc"]) {
    const r = await call("GET", `/tasks/${id}`);
    assert.equal(r.status, 404, `GET /tasks/${id}`);
    assert.deepEqual(r.body, { error: "המשימה לא נמצאה" });
  }
});
test("DELETE — 204, ואז 404", async (t) => {
  const call = await start(t);
  await call("POST", "/tasks", { title: "א" });
  await call("POST", "/tasks", { title: "ב" });
  assert.equal((await call("DELETE", "/tasks/1")).status, 204);
  assert.equal((await call("DELETE", "/tasks/1")).status, 404, "מחיקה שנייה של אותה משימה");
  assert.deepEqual((await call("GET", "/tasks")).body.map((x) => x.id), [2]);
});
test("כל אפליקציה מתחילה ריקה", async (t) => {
  const a = await start(t);
  await a("POST", "/tasks", { title: "א" });
  const b = await start(t);
  assert.deepEqual((await b("GET", "/tasks")).body, [], "המערך צריך להיווצר בתוך createApp, לא ברמת הקובץ");
});
test("בדיקת קלט עם Zod", () => {
  assert.match(code(import.meta.url, FILE), /\bz\.object\s*\(/, "התרגיל מתרגל Zod (שיעור 4): z.object({ title: ..., done: ... })");
});
