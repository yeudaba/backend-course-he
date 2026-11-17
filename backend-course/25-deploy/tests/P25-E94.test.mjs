import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25-E94.ts", ["neonUrlProblems", "shellQuote"]);
const GOOD = "postgresql://neondb_owner:npg_8f3k@ep-cool-01.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

test("neonUrlProblems", async () => {
  const { neonUrlProblems } = await get();
  assert.deepEqual(neonUrlProblems(GOOD), []);
  assert.deepEqual(neonUrlProblems("not a url"), ["not-a-url"]);
  assert.deepEqual(neonUrlProblems("mysql://u@localhost/"), ["protocol", "password", "host", "database", "sslmode"]);
  assert.deepEqual(neonUrlProblems(GOOD.replace("sslmode=require", "sslmode=verify-full")), ["sslmode"]);
  assert.deepEqual(neonUrlProblems(GOOD.replace("?sslmode=require&", "?")), ["sslmode"]);
  assert.deepEqual(neonUrlProblems(GOOD.replace("/neondb?", "/?")), ["database"]);
  assert.deepEqual(neonUrlProblems(GOOD.replace(".neon.tech", ".neon.tech.evil.com")), ["host"]);
});
test("shellQuote — באמת עובד ב־shell", async () => {
  const { shellQuote } = await get();
  assert.equal(shellQuote("abc"), "'abc'");
  assert.equal(shellQuote("it's"), "'it'\\''s'");
  for (const v of [GOOD, "p$5x&y", "a'b'c", "  spaces  ", "$(rm -rf /)", "`x`", ""]) {
    const out = execFileSync("bash", ["-c", `printf '%s' ${shellQuote(v)}`], { encoding: "utf8" });
    assert.equal(out, v, `shell קיבל בדיוק: ${v}`);
  }
});
