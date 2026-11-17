import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { imageTag } = await load(import.meta.url, "P26.3-E82.ts");
const SHA = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";

test("tags", () => {
  assert.equal(imageTag("refs/tags/v1.5.0", SHA), "1.5.0");
  assert.equal(imageTag("refs/tags/v2.0.0-rc.1", SHA), "2.0.0-rc.1");
  for (const bad of ["refs/tags/1.5.0", "refs/tags/v1.5", "refs/tags/release"]) assert.throws(() => imageTag(bad, SHA), Error, bad);
});
test("ענפים", () => {
  assert.equal(imageTag("refs/heads/main", SHA), "main-a1b2c3d");
  assert.equal(imageTag("refs/heads/feature/Login_Page", SHA), "feature-login-page-a1b2c3d");
  assert.equal(imageTag("refs/heads/--fix//שלום  bug--", SHA), "fix-bug-a1b2c3d");
  assert.equal(imageTag("refs/heads/release/1.5.x", SHA), "release-1.5.x-a1b2c3d");
  const long = imageTag("refs/heads/" + "abcdefghij".repeat(3) + "-" + "z".repeat(20), SHA);
  assert.equal(long, "abcdefghij".repeat(3) + "-zzzzzzzzz-a1b2c3d");
  assert.equal(imageTag("refs/heads/" + "a".repeat(39) + "/b", SHA), "a".repeat(39) + "-a1b2c3d", "בלי מקף בסוף אחרי החיתוך");
});
test("קלט לא תקין", () => {
  assert.throws(() => imageTag("refs/heads/main", "a1b2c3d"));
  assert.throws(() => imageTag("refs/heads/main", SHA.toUpperCase()));
  assert.throws(() => imageTag("refs/pull/12/merge", SHA));
});
