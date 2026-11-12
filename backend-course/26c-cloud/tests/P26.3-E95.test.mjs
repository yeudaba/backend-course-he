import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { maskSecrets } = await load(import.meta.url, "P26.3-E95.ts");

test("כל ההופעות, וארוכים קודם", () => {
  assert.equal(maskSecrets("token=abc123 again abc123", ["abc123"]), "token=**** again ****");
  assert.equal(maskSecrets("pw=hunter2-extra and hunter2", ["hunter2", "hunter2-extra"]), "pw=**** and ****");
  assert.equal(maskSecrets("a+b.c$ and aXbXc", ["a+b.c$"]), "**** and aXbXc", "תווים מיוחדים — כפשוטם");
  assert.equal(maskSecrets("nothing", ["", "zzz"]), "nothing");
  assert.equal(maskSecrets("x", []), "x");
});
