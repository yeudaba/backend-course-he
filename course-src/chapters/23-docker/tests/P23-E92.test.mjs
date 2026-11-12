import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E92.ts", ["problems"])).problems;
const row = (Service, State, Health = "", ExitCode = 0) => JSON.stringify({ Name: `p-${Service}-1`, Service, State, Health, ExitCode });

test("הכול תקין", async () => {
  const problems = await get();
  const text = [row("db", "running", "healthy"), row("migrate", "exited", "", 0), row("api", "running", "healthy"), row("web", "running", "")].join("\n") + "\n";
  assert.deepEqual(problems(text, ["migrate"]), []);
});
test("בעיות, לפי הסדר", async () => {
  const problems = await get();
  const text = [row("db", "running", "starting"), row("migrate", "exited", "", 1), row("api", "exited", "", 0), row("web", "restarting"), "", row("worker", "running", "unhealthy")].join("\n");
  assert.deepEqual(problems(text, ["migrate"]), ["db: starting", "migrate: נכשל (exit 1)", "api: exited", "web: restarting", "worker: unhealthy"]);
  assert.deepEqual(problems(row("migrate", "running"), ["migrate", "seed"]), ["migrate: עדיין רץ", "seed: לא נמצא"]);
  assert.deepEqual(problems("", ["migrate"]), ["migrate: לא נמצא"]);
});
