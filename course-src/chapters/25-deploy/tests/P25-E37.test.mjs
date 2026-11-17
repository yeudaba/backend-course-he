import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E37.ts", ["databaseUrlFromService"])).databaseUrlFromService;

test("השירות של השיעור", async () => {
  const f = await get();
  assert.equal(f({ env: { POSTGRES_USER: "tasks", POSTGRES_PASSWORD: "tasks", POSTGRES_DB: "tasks_test" }, ports: ["5432:5432"] }), "postgresql://tasks:tasks@localhost:5432/tasks_test");
});
test("ברירות מחדל ופורט אחר", async () => {
  const f = await get();
  assert.equal(f({ env: { POSTGRES_PASSWORD: "pw" }, ports: ["55432:5432"] }), "postgresql://postgres:pw@localhost:55432/postgres");
  assert.equal(f({ env: { POSTGRES_USER: "app", POSTGRES_PASSWORD: "pw" }, ports: ["6379:6379", "5432"] }), "postgresql://app:pw@localhost:5432/app");
});
test("קידוד", async () => {
  const f = await get();
  const url = f({ env: { POSTGRES_USER: "a@b", POSTGRES_PASSWORD: "p@ss/w:rd#1", POSTGRES_DB: "db" }, ports: ["5432:5432"] });
  assert.equal(url, "postgresql://a%40b:p%40ss%2Fw%3Ard%231@localhost:5432/db");
  const u = new URL(url);
  assert.equal(decodeURIComponent(u.password), "p@ss/w:rd#1");
});
test("שגיאות", async () => {
  const f = await get();
  assert.throws(() => f({ env: {}, ports: ["5432:5432"] }), { message: "חסר POSTGRES_PASSWORD" });
  assert.throws(() => f({ ports: ["5432:5432"] }), { message: "חסר POSTGRES_PASSWORD" });
  assert.throws(() => f({ env: { POSTGRES_PASSWORD: "x" } }), { message: "השירות לא חושף את 5432" });
  assert.throws(() => f({ env: { POSTGRES_PASSWORD: "x" }, ports: ["5433:5433"] }), { message: "השירות לא חושף את 5432" });
});
