import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E45.ts", ["runArgs"])).runArgs;

test("מלא, לפי הסדר", async () => {
  const runArgs = await get();
  assert.deepEqual(
    runArgs({ image: "postgres:18-alpine", name: "dev-db", detach: true, restart: "unless-stopped", env: { POSTGRES_PASSWORD: "secret", POSTGRES_DB: "shop" }, ports: ["127.0.0.1:55432:5432"], volumes: ["dev-db-data:/var/lib/postgresql"] }),
    ["run", "-d", "--name", "dev-db", "--restart", "unless-stopped", "-e", "POSTGRES_PASSWORD=secret", "-e", "POSTGRES_DB=shop", "-p", "127.0.0.1:55432:5432", "-v", "dev-db-data:/var/lib/postgresql", "postgres:18-alpine"],
  );
  assert.deepEqual(runArgs({ image: "node:24-alpine", rm: true, command: ["node", "-e", "console.log(process.version)"] }), ["run", "--rm", "node:24-alpine", "node", "-e", "console.log(process.version)"]);
  assert.deepEqual(runArgs({ image: "localhost:5000/app:dev" }), ["run", "localhost:5000/app:dev"]);
  assert.deepEqual(runArgs({ image: "app@sha256:abc", env: { GREETING: "שלום עולם" } }), ["run", "-e", "GREETING=שלום עולם", "app@sha256:abc"], "ערך עם רווח — ארגומנט אחד");
  assert.deepEqual(runArgs({ image: "app:1", rm: true, restart: "no" }), ["run", "--rm", "--restart", "no", "app:1"]);
});
test("שגיאות", async () => {
  const runArgs = await get();
  for (const image of ["postgres", "dana/api", "localhost:5000/app"]) assert.throws(() => runArgs({ image }), { message: `צריך tag מפורש: ${image}` });
  assert.throws(() => runArgs({ image: "app:1", rm: true, restart: "always" }), { message: "--rm ו־--restart לא הולכים יחד" });
});
