import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E48.mjs", ["envStatus"])).envStatus;

test("מוגדר / ריק / חסר, לפי הסדר", async () => {
  const envStatus = await get();
  assert.deepEqual(envStatus({ PORT: "8080", DEBUG: "  " }, ["PORT", "DEBUG", "JWT_SECRET"]), ["PORT: מוגדר", "DEBUG: ריק", "JWT_SECRET: חסר"]);
  assert.deepEqual(envStatus({ A: "", B: "0", C: "false" }, ["C", "B", "A"]), ["C: מוגדר", "B: מוגדר", "A: ריק"]);
  assert.deepEqual(envStatus({}, []), []);
});
test("הערכים לא מודפסים", async () => {
  const envStatus = await get();
  const lines = envStatus({ DATABASE_URL: "postgres://dana:s3cret@db/shop", JWT_SECRET: "abcdefghijk" }, ["DATABASE_URL", "JWT_SECRET"]);
  assert.ok(!lines.join("\n").includes("s3cret") && !lines.join("\n").includes("abcdefghijk"), "אסור שהערך יופיע בשורה");
});
