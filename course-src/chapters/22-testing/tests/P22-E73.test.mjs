import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest } from "../../tools/nest.mjs";

const m = loadNest(import.meta.url, "P22-E73.ts");
const demo = loadNest(import.meta.url, "../tests/_P22-E73-app.ts");

function fakeNotes() {
  const items = [];
  return { items, list: async () => [...items], add: async (t) => void items.push(t) };
}

test("החלפות, configure ו־http", async (t) => {
  assert.equal(typeof m.createTestApp, "function", "הקובץ לא מייצא את createTestApp");
  const notes = fakeNotes();
  const ctx = await m.createTestApp(
    demo.AppModule,
    [[demo.CLOCK, { now: () => new Date("2026-11-04T10:00:00Z") }], [demo.NOTES_REPO, notes]],
    (app) => app.setGlobalPrefix("api"),
  );
  t.after(() => ctx.close());
  assert.ok(ctx.app?.getHttpServer, "app הוא אפליקציית Nest");
  let r = await ctx.http().get("/api/now");
  assert.equal(r.status, 200, "configure רץ לפני init (setGlobalPrefix)");
  assert.deepEqual(r.body, { now: "2026-11-04T10:00:00.000Z" }, "CLOCK הוחלף");
  r = await ctx.http().post("/api/notes").send({ text: "חלב" });
  assert.equal(r.status, 201);
  r = await ctx.http().get("/api/notes");
  assert.deepEqual(r.body, ["חלב"], "NOTES_REPO הוחלף");
  assert.deepEqual(notes.items, ["חלב"]);
  assert.equal((await ctx.http().get("/now")).status, 404, "בלי prefix — לא קיים");
});
test("בלי overrides ובלי configure", async (t) => {
  const ctx = await m.createTestApp(demo.AppModule);
  t.after(() => ctx.close());
  assert.equal((await ctx.http().get("/now")).status, 200);
  assert.equal((await ctx.http().get("/notes")).status, 500, "ה־repository האמיתי לא הוחלף ← 500");
});
test("close סוגר", async () => {
  const ctx = await m.createTestApp(demo.AppModule);
  await ctx.close();
  await ctx.close().catch(() => {});
});
