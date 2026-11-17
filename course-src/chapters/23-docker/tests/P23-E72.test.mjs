import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E72.ts", ["interpolate"])).interpolate;
const ENV = { JWT_SECRET: "abc", LOG_LEVEL: "", API_PORT: "4000", NAME_2: "x" };

test("הצורות", async () => {
  const f = await get();
  assert.equal(f("${API_PORT:-3000}:3000", ENV), "4000:3000");
  assert.equal(f("${WEB_PORT:-5500}:80", ENV), "5500:80");
  assert.equal(f("level=${LOG_LEVEL:-info}", ENV), "level=info", ":- — גם ריק");
  assert.equal(f("level=${LOG_LEVEL-info}", ENV), "level=", "- — רק לא מוגדר");
  assert.equal(f("level=${MISSING-info}", ENV), "level=info");
  assert.equal(f("$JWT_SECRET/${JWT_SECRET}/$NAME_2/${NOPE}/$NOPE", ENV), "abc/abc/x//");
  assert.equal(f("price: $$5 and $${API_PORT}", ENV), "price: $5 and ${API_PORT}", "$$ ← $ ולא מתחיל משתנה");
  assert.equal(f("no vars at all", ENV), "no vars at all");
  assert.equal(f("${A:-$}", {}), "$");
});
test("חובה", async () => {
  const f = await get();
  assert.equal(f("${JWT_SECRET:?חסר}", ENV), "abc");
  assert.throws(() => f("${MISSING:?הגדר MISSING בקובץ .env}", ENV), { message: "MISSING: הגדר MISSING בקובץ .env" });
  assert.throws(() => f("${LOG_LEVEL:?ריק}", ENV), { message: "LOG_LEVEL: ריק" }, ":? — גם ריק");
  assert.equal(f("${LOG_LEVEL?ריק}", ENV), "", "? — ריק מותר");
  assert.throws(() => f("${NOPE?חסר}", ENV), { message: "NOPE: חסר" });
});
test("ערך עם $ לא מוחלף שוב", async () => {
  const f = await get();
  assert.equal(f("${PASS}", { PASS: "p$HOME", HOME: "/root" }), "p$HOME");
});
