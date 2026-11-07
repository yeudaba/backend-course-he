import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E24.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("ספרים", async (t) => {
  const call = await start(t, createApp());
  let res = await call("POST", "/books", { title: "סיפור פשוט", author: "ש״י עגנון", copies: 2 });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, title: "סיפור פשוט", author: "ש״י עגנון", copies: 2, available: 2 });
  for (let i = 0; i < 12; i++) await call("POST", "/books", { title: `ספר ${i}`, author: i % 2 ? "Amos Oz" : "Other", copies: 1 });
  res = await call("GET", "/books?author=amos&limit=4&page=2");
  assert.deepEqual(res.body.meta, { page: 2, limit: 4, total: 6, totalPages: 2 });
  assert.equal(res.body.data.length, 2);
  res = await call("GET", "/books");
  assert.deepEqual(res.body.meta, { page: 1, limit: 10, total: 13, totalPages: 2 });
  assert.deepEqual((await call("GET", "/books/1")).body.title, "סיפור פשוט");
  assert.equal((await call("GET", "/books/99")).body.error.code, "BOOK_NOT_FOUND");
  assert.equal((await call("GET", "/books/abc")).status, 400);
  res = await call("POST", "/books", { title: "", author: "x", copies: 0 });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.deepEqual(res.body.error.details.map((d) => d.path).sort(), ["copies", "title"]);
  assert.equal((await call("GET", "/books?limit=51")).status, 400);
  assert.equal((await call("POST", "/books", undefined, { raw: "{" })).body.error.code, "INVALID_JSON");
  assert.equal((await call("GET", "/nothing")).body.error.code, "NOT_FOUND");
});

test("השאלות", async (t) => {
  let clock = new Date("2026-11-01T10:00:00Z");
  const call = await start(t, createApp({ now: () => clock }));
  await call("POST", "/books", { title: "א", author: "x", copies: 1 });
  await call("POST", "/books", { title: "ב", author: "y", copies: 2 });

  let res = await call("POST", "/books/1/loans", { member: "דנה" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, bookId: 1, member: "דנה", loanedAt: "2026-11-01T10:00:00.000Z", dueAt: "2026-11-15T10:00:00.000Z", returnedAt: null });
  assert.equal((await call("GET", "/books/1")).body.available, 0);
  assert.equal((await call("GET", "/books?available=true")).body.data.map((b) => b.id).join(), "2");
  res = await call("POST", "/books/1/loans", { member: "דנה" });
  assert.equal(res.body.error.code, "ALREADY_BORROWED");
  res = await call("POST", "/books/1/loans", { member: "יוסי" });
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, "NO_COPIES");
  assert.equal((await call("POST", "/books/1/loans", { member: "" })).status, 400);
  assert.equal((await call("POST", "/books/9/loans", { member: "x" })).status, 404);

  await call("POST", "/books/2/loans", { member: "יוסי" });
  clock = new Date("2026-11-10T10:00:00Z");
  await call("POST", "/books/2/loans", { member: "רון" });
  clock = new Date("2026-11-16T00:00:00Z");
  assert.deepEqual((await call("GET", "/loans/overdue")).body.map((l) => l.id), [1, 2]);

  res = await call("POST", "/loans/1/return");
  assert.equal(res.status, 200);
  assert.equal(res.body.returnedAt, "2026-11-16T00:00:00.000Z");
  assert.equal((await call("GET", "/books/1")).body.available, 1);
  assert.equal((await call("POST", "/loans/1/return")).body.error.code, "ALREADY_RETURNED");
  assert.equal((await call("POST", "/loans/9/return")).body.error.code, "LOAN_NOT_FOUND");
  assert.deepEqual((await call("GET", "/loans/overdue")).body.map((l) => l.id), [2]);
  assert.equal((await call("POST", "/books/1/loans", { member: "דנה" })).status, 201, "אחרי החזרה — מותר שוב");
});
