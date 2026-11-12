import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { nextVersion } = await load(import.meta.url, "P26.3-E100.ts");

test("patch, minor, major", () => {
  assert.equal(nextVersion("1.4.2", ["fix(orders): rounding", "docs: readme"]), "1.4.3");
  assert.equal(nextVersion("1.4.2", ["perf: faster list"]), "1.4.3");
  assert.equal(nextVersion("1.4.2", ["fix: a", "feat(cart): coupons", "chore: deps"]), "1.5.0");
  assert.equal(nextVersion("1.4.2", ["feat!: new API", "fix: x"]), "2.0.0");
  assert.equal(nextVersion("1.4.2", ["refactor(api)!: drop v1"]), "2.0.0");
  assert.equal(nextVersion("0.9.9", ["feat: x\n\nBREAKING CHANGE: removed /v1"]), "1.0.0");
});
test("בלי שינוי ← null; פורמטים לא תקינים", () => {
  assert.equal(nextVersion("1.4.2", ["docs: x", "chore: y", "Merge branch 'main'", "feature: z", "feat-flag cleanup"]), null);
  assert.equal(nextVersion("1.4.2", []), null);
  assert.equal(nextVersion("1.4.2", ["fix: x\n\nnot BREAKING CHANGE: here"]), "1.4.3", "BREAKING CHANGE רק בתחילת שורה");
  for (const bad of ["1.4", "v1.4.2", "1.4.x"]) assert.throws(() => nextVersion(bad, ["fix: a"]), Error, bad);
});
