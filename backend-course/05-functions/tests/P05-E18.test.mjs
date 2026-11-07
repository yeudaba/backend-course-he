import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { hasDigit, hasUpper, hasSpecial, passwordScore, passwordLabel } = await load(import.meta.url, "P05-E18.js");

test("hasDigit / hasUpper / hasSpecial", () => {
  assert.equal(hasDigit("abc1"), true);
  assert.equal(hasDigit("abc"), false);
  assert.equal(hasUpper("abC"), true);
  assert.equal(hasUpper("abc123!"), false);
  assert.equal(hasSpecial("a#b"), true);
  assert.equal(hasSpecial("ab-c"), false);
});
test("passwordScore", () => {
  assert.equal(passwordScore("abc"), 0);
  assert.equal(passwordScore("abcdefgh"), 1);
  assert.equal(passwordScore("Secret123"), 3);
  assert.equal(passwordScore("Secret123!"), 4);
});
test("passwordLabel", () => {
  assert.equal(passwordLabel("abc"), "חלשה");
  assert.equal(passwordLabel("abcdefg1"), "בינונית");
  assert.equal(passwordLabel("Secret123!"), "חזקה");
});
