import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseCpu, parseMemory, formatMemory } = await load(import.meta.url, "P25.5-E14.ts");

test("parseCpu ← millicores", () => {
  assert.equal(parseCpu("250m"), 250);
  assert.equal(parseCpu("1"), 1000);
  assert.equal(parseCpu("0.5"), 500);
  assert.equal(parseCpu("1.5"), 1500);
  assert.equal(parseCpu(2), 2000);
  for (const bad of ["", "abc", "250M", "-1", "0.0001"]) assert.throws(() => parseCpu(bad), undefined, `"${bad}"`);
});
test("parseMemory ← בתים: Mi (בינארי) מול M (עשרוני)", () => {
  assert.equal(parseMemory("512Mi"), 512 * 1024 * 1024);
  assert.equal(parseMemory("512M"), 512_000_000);
  assert.equal(parseMemory("1Gi"), 2 ** 30);
  assert.equal(parseMemory("1.5Gi"), 1.5 * 2 ** 30);
  assert.equal(parseMemory("64Ki"), 65536);
  assert.equal(parseMemory("1000"), 1000);
  for (const bad of ["", "512mb", "1GB", "Mi"]) assert.throws(() => parseMemory(bad), undefined, `"${bad}"`);
});
test("formatMemory", () => {
  assert.equal(formatMemory(2 ** 30), "1Gi");
  assert.equal(formatMemory(1536 * 2 ** 20), "1536Mi");
  assert.equal(formatMemory(256 * 2 ** 20), "256Mi");
  assert.equal(formatMemory(1000), "1000");
});
