import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { NotesModule, NOTES_REPOSITORY, InMemoryNotesRepository } = loadNest(import.meta.url, "P20-E18.ts");

test("InMemoryNotesRepository", async () => {
  const repo = new InMemoryNotesRepository();
  assert.deepEqual(await repo.add("a"), { id: 1, text: "a" });
  assert.deepEqual(await repo.list(), [{ id: 1, text: "a" }]);
});
test("ה־service מדבר רק עם ה־token — אפשר להחליף ב־fake", async (t) => {
  const calls = [];
  const fake = {
    list: async () => [{ id: 99, text: "מה־fake" }],
    add: async (text) => { calls.push(text); return { id: 100, text }; },
  };
  const { call } = await nestApp(t, NotesModule, { validation: true, overrides: [[NOTES_REPOSITORY, fake]] });
  assert.deepEqual((await call("GET", "/notes")).body, [{ id: 99, text: "מה־fake" }]);
  const res = await call("POST", "/notes", { text: "  לקנות חלב  " });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 100, text: "לקנות חלב" });
  assert.deepEqual(calls, ["לקנות חלב"], "ה־service מנקה רווחים לפני השמירה");
  assert.equal((await call("POST", "/notes", { text: "" })).status, 400);
});
test("בלי override — זיכרון", async (t) => {
  const { call } = await nestApp(t, NotesModule, { validation: true });
  await call("POST", "/notes", { text: "x" });
  assert.deepEqual((await call("GET", "/notes")).body, [{ id: 1, text: "x" }]);
});
