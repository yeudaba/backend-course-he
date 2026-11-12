import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P23-E77.ts", ["toDatabaseUrl", "parseDatabaseUrl"]);

test("בנייה עם קידוד", async () => {
  const { toDatabaseUrl } = await get();
  assert.equal(toDatabaseUrl({ user: "tasks", password: "tasks", host: "db", port: 5432, database: "tasks" }), "postgresql://tasks:tasks@db:5432/tasks");
  assert.equal(toDatabaseUrl({ user: "app", password: "p@ss/w:rd#1", host: "localhost", port: 55432, database: "shop" }), "postgresql://app:p%40ss%2Fw%3Ard%231@localhost:55432/shop");
});
test("פירוק", async () => {
  const { parseDatabaseUrl } = await get();
  assert.deepEqual(parseDatabaseUrl("postgresql://app:p%40ss%2Fw%3Ard%231@localhost:55432/shop"), { user: "app", password: "p@ss/w:rd#1", host: "localhost", port: 55432, database: "shop" });
  assert.deepEqual(parseDatabaseUrl("postgres://u:p@db/x"), { user: "u", password: "p", host: "db", port: 5432, database: "x" });
  for (const bad of ["mysql://u:p@db:3306/x", "postgresql://u:p@db:5432", "postgresql://u:p@db:5432/", "not a url"]) {
    assert.throws(() => parseDatabaseUrl(bad), { message: "DATABASE_URL לא תקין" }, bad);
  }
});
test("הלוך ושוב", async () => {
  const { toDatabaseUrl, parseDatabaseUrl } = await get();
  for (const c of [
    { user: "a", password: "b", host: "db", port: 5432, database: "c" },
    { user: "דנה", password: "שלום עולם?&=", host: "127.0.0.1", port: 1, database: "my db" },
    { user: "u", password: "%41", host: "h", port: 65535, database: "d" },
  ]) assert.deepEqual(parseDatabaseUrl(toDatabaseUrl(c)), c);
});
