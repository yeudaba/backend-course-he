import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const FILE = "P20-E26.ts";
function mod() {
  const m = loadNest(import.meta.url, FILE);
  assert.ok(m.BookmarksModule, "הקובץ לא מייצא את BookmarksModule. כתוב: export class BookmarksModule {} עם @Module({...})");
  return m.BookmarksModule;
}

test("POST ו־GET", async (t) => {
  const { call } = await nestApp(t, mod(), { validation: true });
  const r = await call("POST", "/bookmarks", { url: "https://nestjs.com", title: "  Nest docs ", tags: ["nest", "docs"] });
  assert.equal(r.status, 201, "POST מחזיר 201");
  assert.deepEqual(r.body, { id: 1, url: "https://nestjs.com", title: "Nest docs", tags: ["nest", "docs"] }, "title אחרי trim");
  const r2 = await call("POST", "/bookmarks", { url: "https://www.postgresql.org/docs/", title: "PG" });
  assert.deepEqual(r2.body, { id: 2, url: "https://www.postgresql.org/docs/", title: "PG", tags: [] }, "בלי tags ← []");
  assert.deepEqual((await call("GET", "/bookmarks")).body.map((b) => b.id), [1, 2]);
  assert.deepEqual((await call("GET", "/bookmarks/2")).body.title, "PG");
});
test("סינון לפי tag", async (t) => {
  const { call } = await nestApp(t, mod(), { validation: true });
  await call("POST", "/bookmarks", { url: "https://a.com", title: "A", tags: ["x"] });
  await call("POST", "/bookmarks", { url: "https://b.com", title: "B", tags: ["y", "x"] });
  await call("POST", "/bookmarks", { url: "https://c.com", title: "C" });
  assert.deepEqual((await call("GET", "/bookmarks?tag=x")).body.map((b) => b.title), ["A", "B"]);
  assert.deepEqual((await call("GET", "/bookmarks?tag=zzz")).body, []);
});
test("404 ו־400 על id", async (t) => {
  const { call } = await nestApp(t, mod(), { validation: true });
  const r = await call("GET", "/bookmarks/9");
  assert.equal(r.status, 404);
  assert.equal(r.body?.message, "סימנייה 9 לא נמצאה", "NotFoundException עם ההודעה");
  assert.equal((await call("GET", "/bookmarks/abc")).status, 400, "id שאינו מספר ← 400 (ParseIntPipe)");
});
test("ולידציה ← 400", async (t) => {
  const { call } = await nestApp(t, mod(), { validation: true });
  const bad = [
    {},
    { url: "not a url", title: "A" },
    { url: "https://a.com", title: "" },
    { url: "https://a.com", title: "x".repeat(101) },
    { url: "https://a.com", title: "A", tags: "x" },
    { url: "https://a.com", title: "A", tags: [1] },
    { url: "https://a.com", title: "A", tags: ["1", "2", "3", "4", "5", "6"] },
    { url: "https://a.com", title: "A", id: 7 },
  ];
  for (const body of bad) assert.equal((await call("POST", "/bookmarks", body)).status, 400, JSON.stringify(body));
  assert.deepEqual((await call("GET", "/bookmarks")).body, [], "בקשה שנכשלה לא מוסיפה");
});
test("DELETE ← 204, ואז 404", async (t) => {
  const { call } = await nestApp(t, mod(), { validation: true });
  await call("POST", "/bookmarks", { url: "https://a.com", title: "A" });
  await call("POST", "/bookmarks", { url: "https://b.com", title: "B" });
  const r = await call("DELETE", "/bookmarks/1");
  assert.equal(r.status, 204, "DELETE מחזיר 204 (@HttpCode(204))");
  assert.equal((await call("DELETE", "/bookmarks/1")).status, 404);
  assert.deepEqual((await call("GET", "/bookmarks")).body.map((b) => b.id), [2]);
});
