import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { loadConfig } = await load(import.meta.url, "P08-E18.js");

test("תקין עם ברירת מחדל", () => assert.deepEqual(loadConfig({ DATABASE_URL: "db", JWT_SECRET: "s" }), { port: 3000, databaseUrl: "db", jwtSecret: "s" }));
test("PORT מומר למספר", () => assert.equal(loadConfig({ DATABASE_URL: "db", JWT_SECRET: "s", PORT: "8080" }).port, 8080));
test("כל החסרים בהודעה אחת", () => {
  assert.throws(() => loadConfig({}), { message: "חסרות הגדרות: DATABASE_URL, JWT_SECRET" });
  assert.throws(() => loadConfig({ DATABASE_URL: "db" }), { message: "חסרות הגדרות: JWT_SECRET" });
});
test("PORT לא תקין", () => {
  for (const PORT of ["abc", "0", "70000", "80.5"]) assert.throws(() => loadConfig({ DATABASE_URL: "db", JWT_SECRET: "s", PORT }), { message: "PORT לא תקין" });
});
