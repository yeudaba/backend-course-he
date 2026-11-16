import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { hotFunctions } = await load(import.meta.url, "P28.5-E48.ts");

const samples = [
  ["main", "handleRequest", "pbkdf2Sync"],
  ["main", "handleRequest", "pbkdf2Sync"],
  ["main", "handleRequest", "pbkdf2Sync"],
  ["main", "handleRequest", "JSON.stringify"],
  ["main", "walk", "walk", "walk"],
  ["main", "handleRequest"],
  ["main", "gc"],
  [],
];

test("self ו־total", () => {
  assert.deepEqual(hotFunctions(samples, 10), [
    { name: "pbkdf2Sync", self: 37.5, total: 37.5 },
    { name: "handleRequest", self: 12.5, total: 62.5 },
    { name: "JSON.stringify", self: 12.5, total: 12.5 },
    { name: "gc", self: 12.5, total: 12.5 },
    { name: "walk", self: 12.5, total: 12.5 },
    { name: "main", self: 0, total: 87.5 },
  ]);
});
test("top", () => {
  assert.deepEqual(hotFunctions(samples).map((x) => x.name), ["pbkdf2Sync", "handleRequest", "JSON.stringify", "gc", "walk"]);
  assert.deepEqual(hotFunctions(samples, 1), [{ name: "pbkdf2Sync", self: 37.5, total: 37.5 }]);
  assert.deepEqual(hotFunctions([["a"], ["a", "b"], ["a", "b"]], 5), [{ name: "b", self: 66.7, total: 66.7 }, { name: "a", self: 33.3, total: 100 }]);
});
