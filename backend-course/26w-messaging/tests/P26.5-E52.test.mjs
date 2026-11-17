import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { bindingMatches } = await load(import.meta.url, "P26.5-E52.ts");

test("* ו־#", () => {
  const cases = [
    ["order.*", "order.created", true], ["order.*", "order.created.il", false], ["order.*", "order", false],
    ["order.#", "order", true], ["order.#", "order.created.il", true], ["order.#", "orders.created", false],
    ["#", "", true], ["#", "a.b.c", true], ["*", "", false], ["*", "a", true],
    ["*.created.*", "order.created.il", true], ["*.created.*", "order.created", false],
    ["#.il", "il", true], ["#.il", "order.created.il", true], ["#.il", "order.il.vip", false],
    ["order.#.il", "order.il", true], ["order.#.il", "order.a.b.il", true],
    ["a.#.#.b", "a.b", true], ["order.created", "order.created", true], ["order.created", "order.Created", false],
  ];
  for (const [p, k, want] of cases) assert.equal(bindingMatches(p, k), want, `${p} ~ ${k}`);
});
